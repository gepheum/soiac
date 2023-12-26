import { FileReader } from "./io.ts";
import {
  isStringLiteral,
  unquoteAndUnescape,
  valueHasPrimitiveType,
} from "./literals.ts";
import {
  Error,
  ErrorSink,
  Field,
  Import,
  Module,
  MutableArrayType,
  MutableModule,
  MutableRecord,
  MutableRecordLocation,
  MutableResolvedType,
  MutableValue,
  Record,
  RecordKey,
  RecordLocation,
  ResolvedRecordRef,
  ResolvedType,
  Result,
  Token,
  UnresolvedRecordRef,
  UnresolvedType,
  Value,
} from "./module.ts";
import { parseModule } from "./parser.ts";
import { tokenizeModule } from "./tokenizer.ts";
import * as paths from "path";

export class ModuleSet {
  constructor(
    private readonly fileReader: FileReader,
    private readonly rootPath: string,
  ) {}

  parseAndResolve(modulePath: string): Result<Module | null> {
    const inMap = this.modules.get(modulePath);
    if (inMap !== undefined) {
      return inMap;
    }
    const result = this.doParseAndResolve(modulePath);
    this.modules.set(modulePath, result);
    this.mutableErrors.push(...result.errors);
    return result;
  }

  /** Called by `parseAndValidate` when the module is not in the map already. */
  private doParseAndResolve(modulePath: string): Result<Module | null> {
    const code = this.fileReader.readTextFile(
      paths.join(this.rootPath, modulePath.slice()),
    );
    if (code === undefined) {
      return {
        result: null,
        errors: [],
      };
    }

    const sentenceNode = tokenizeModule(code, modulePath);
    if (sentenceNode.errors.length !== 0) {
      return {
        result: null,
        errors: sentenceNode.errors,
      };
    }

    const errors: Error[] = [];

    const parsedModule = parseModule(sentenceNode.result, modulePath);
    errors.push(...parsedModule.errors);
    const module = parsedModule.result;

    // Process all imports.
    const pathToImports = new Map<string, Array<Import>>();
    for (const declaration of module.declarations) {
      if (declaration.kind !== "import" && declaration.kind !== "import-as") {
        continue;
      }
      const otherModulePath = getModulePath(declaration, modulePath, errors);
      if (otherModulePath === undefined) {
        // An error was already registered.
        continue;
      }
      let imports = pathToImports.get(otherModulePath);
      if (!imports) {
        imports = [];
        pathToImports.set(otherModulePath, imports);
      }
      imports.push(declaration);

      // Add the imported module to the module set.
      const circularDependencyMessage = "Circular dependency between modules";
      if (this.inProgressSet.has(modulePath)) {
        errors.push({
          token: declaration.modulePath,
          message: circularDependencyMessage,
        });
        continue;
      }
      this.inProgressSet.add(modulePath);
      const otherModule = this.parseAndResolve(otherModulePath);
      this.inProgressSet.delete(modulePath);

      if (otherModule.result === null) {
        errors.push({
          token: declaration.modulePath,
          message: "Module not found",
        });
      } else if (otherModule.errors.length !== 0) {
        const hasCircularDependency = otherModule.errors.some(
          (e) => e.message === circularDependencyMessage,
        );
        const message = hasCircularDependency
          ? circularDependencyMessage
          : "Imported module has errors";
        errors.push({
          token: declaration.modulePath,
          message: message,
        });
      }
    }

    const pathToImportedNames = module.pathToImportedNames;
    for (const [path, imports] of pathToImports.entries()) {
      const importsNoAlias = imports.filter((i) => i.kind === "import");
      const importsWithAlias = imports.filter((i) => i.kind === "import-as");

      if (importsNoAlias.length && importsWithAlias.length) {
        for (const importNoAlias of importsNoAlias) {
          errors.push({
            token: importNoAlias.name,
            message: "Module already imported with an alias",
          });
        }
        continue;
      }
      if (importsWithAlias.length >= 2) {
        for (const importWithAlias of importsWithAlias.slice(1)) {
          errors.push({
            token: importWithAlias.name,
            message: "Module already imported with a different alias",
          });
        }
        continue;
      }

      if (importsNoAlias.length) {
        const names = new Set<string>();
        for (const importNoAlias of importsNoAlias) {
          names.add(importNoAlias.name.text);
        }
        pathToImportedNames[path] = {
          kind: "some",
          names: names,
        };
      } else {
        const alias = importsWithAlias[0].name.text;
        pathToImportedNames[path] = {
          kind: "all",
          alias: alias,
        };
      }
    }

    const result: Result<Module> = {
      result: module,
      errors: errors,
    };

    if (errors.length) {
      return result;
    }

    const moduleRecords = collectModuleRecords(module);
    module.records.push(...moduleRecords.values());

    this.mutableResolvedModules.push(module);

    // We can't merge these 3 loops into a single one, each operation must run
    // after the last operation ran on the whole map.

    // Loop 1: merge the module records map into the cross-module record map.
    moduleRecords.forEach((v, k) => this.mutableRecordMap.set(k, v));

    // Loop 2: resolve every field type of every record in the module.
    // Store the result in the Field object.
    const usedImports = new Set<string>();
    const typeResolver = new TypeResolver(
      module,
      this.modules,
      usedImports,
      errors,
    );
    for (const record of moduleRecords.values()) {
      this.storeResolvedFieldTypes(record, typeResolver);
    }

    // Loop 3: once all the types of record fields have been resolved.
    for (const record of moduleRecords.values()) {
      /// For every field, determine if the field is recursive, i.e. the field
      // type depends on the record where the field is defined.
      // Store the result in the Field object.
      this.storeFieldRecursivity(record.record);
      // If the record has explicit numbering, register an error if any field
      // has a direct dependency on a record with implicit numbering.
      this.verifyNumberingConstraint(record.record, errors);
      // Verify that the `key` field of every array type is valid.
      for (const field of record.record.fields) {
        const { type } = field;
        if (type) {
          this.validateArrayKeys(type, errors);
        }
      }
      if (record.record.recordType === "enum") {
        // Verifies that the default value of the enum has a finite
        // representation.
        this.verifyEnumDefaultConstraint(record.record, errors);
      }
    }
    // Resolve every request/response type of every procedure in the module.
    // Store the result in the Procedure object.
    for (const procedure of module.procedures) {
      {
        const request = procedure.unresolvedRequestType;
        const requestType = typeResolver.resolve(request, "top-level");
        if (requestType) {
          this.validateArrayKeys(requestType, errors);
          procedure.requestType = requestType;
        }
      }
      {
        const response = procedure.unresolvedResponseType;
        const responseType = typeResolver.resolve(response, "top-level");
        if (responseType) {
          this.validateArrayKeys(responseType, errors);
          procedure.responseType = responseType;
        }
      }
    }
    // Resolve every constant type. Store the result in the constant object.
    for (const constant of module.constants) {
      const { unresolvedType } = constant;
      const type = typeResolver.resolve(unresolvedType, "top-level");
      if (type) {
        this.validateArrayKeys(type, errors);
        this.verifyValueType(constant.value, type, errors);
        constant.type = type;
      }
    }

    ensureAllImportsAreUsed(module, usedImports, errors);

    freezeDeeply(module);

    return result;
  }

  private storeResolvedFieldTypes(
    record: MutableRecordLocation,
    typeResolver: TypeResolver,
  ): void {
    for (const field of record.record.fields) {
      if (field.unresolvedType === undefined) {
        // A constant enum field.
        continue;
      }
      field.type = typeResolver.resolve(field.unresolvedType, record);
    }
  }

  private storeFieldRecursivity(record: MutableRecord) {
    for (const field of record.fields) {
      if (!field.type) {
        continue;
      }
      const deps = new Set<RecordKey>();
      this.collectTypeDeps(field.type, deps);
      field.isRecursive = deps.has(record.key);
    }
  }

  private collectTypeDeps(input: ResolvedType, out: Set<RecordKey>): void {
    switch (input.kind) {
      case "record": {
        const { key } = input;
        if (out.has(key)) {
          return;
        }
        out.add(key);
        // Recursively add deps of all fields of the record.
        const record = this.recordMap.get(key)!.record;
        for (const field of record.fields) {
          if (field.type !== undefined) {
            this.collectTypeDeps(field.type, out);
          }
        }
        break;
      }
      case "array": {
        this.collectTypeDeps(input.item, out);
        break;
      }
      case "nullable": {
        this.collectTypeDeps(input.value, out);
        break;
      }
    }
  }

  /**
   * If the record has explicit numbering, register an error if any field has a
   * direct dependency on a record with implicit numbering.
   */
  private verifyNumberingConstraint(record: Record, errors: ErrorSink): void {
    if (record.numbering !== "explicit") {
      return;
    }
    for (const field of record.fields) {
      if (!field.type) {
        continue;
      }
      const invalidRef = this.referencesImplicitlyNumberedRecord(field.type);
      if (invalidRef) {
        errors.push({
          token: invalidRef.refToken,
          message:
            `Field type references a ${invalidRef.recordType} with implicit ` +
            `numbering, but field belongs to a ${record.recordType} with ` +
            `explicit numbering`,
        });
      }
    }
  }

  private referencesImplicitlyNumberedRecord(
    input: ResolvedType,
  ): ResolvedRecordRef | undefined {
    switch (input.kind) {
      case "array":
        return this.referencesImplicitlyNumberedRecord(input.item);
      case "nullable":
        return this.referencesImplicitlyNumberedRecord(input.value);
      case "primitive":
        return undefined;
      case "record": {
        const record = this.recordMap.get(input.key)!.record;
        return record.numbering === "implicit" ? input : undefined;
      }
    }
    const _: never = input;
  }

  /**
   * Verifies that the `key` field of every array type found in `topLevelType`
   * is valid. Populates the `keyType` field of every field path.
   */
  private validateArrayKeys(
    topLevelType: MutableResolvedType,
    errors: ErrorSink,
  ): void {
    const findFieldOrError = (
      struct: Record,
      fieldName: Token,
    ): Field | undefined => {
      const field = struct.nameToDeclaration[fieldName.text];
      if (!field || field.kind !== "field") {
        errors.push({
          token: fieldName,
          message: `Field not found in struct ${struct.name.text}`,
        });
        return undefined;
      }
      return field;
    };

    const validate = (type: MutableArrayType): void => {
      const { key, item } = type;
      if (!key) {
        return;
      }
      const { fieldNames } = key;
      if (item.kind !== "record" || item.recordType !== "struct") {
        errors.push({
          token: key.pipeToken,
          message: "Item must have struct type",
        });
        return;
      }
      // Iterate the fields in the sequence.
      let struct = this.recordMap.get(item.key)!.record;
      for (const fieldName of fieldNames.slice(0, -1)) {
        const field = findFieldOrError(struct, fieldName);
        if (!field) {
          return;
        }
        const fieldType = field.type!;
        if (fieldType.kind !== "record" || fieldType.recordType !== "struct") {
          errors.push({
            token: fieldName,
            message: "Does not have struct type",
          });
          return;
        }
        struct = this.recordMap.get(fieldType.key)!.record;
      }
      const lastFieldName = fieldNames.at(-1)!;
      const lastField = findFieldOrError(struct, lastFieldName);
      if (!lastField) {
        return;
      }
      const keyType = lastField.type!;
      if (
        keyType.kind === "primitive" ||
        (keyType.kind === "record" && keyType.recordType === "enum")
      ) {
        key.keyType = keyType;
      } else {
        errors.push({
          token: lastFieldName,
          message: "Does not have primitive or enum type",
        });
        return;
      }
    };

    const traverseType = (type: MutableResolvedType): void => {
      switch (type.kind) {
        case "array":
          validate(type);
          return traverseType(type.item);
        case "nullable":
          return traverseType(type.value);
      }
    };

    traverseType(topLevelType);
  }

  /**
   * Verifies that the default value of the enum has a finite representation.
   *
   * @example enum with an infinite representation:
   *   enum A { f: B; }
   *   enum B { f: C; }
   *   enum C { f: A; }
   */
  private verifyEnumDefaultConstraint(
    record: MutableRecord,
    errors: ErrorSink,
  ): void {
    const originalRecord = record;
    const traversedRecords = new Set<RecordKey>();
    while (true) {
      traversedRecords.add(record.key);
      const zeroField = record.fields.find((f) => f.number === 0)!;
      const { type } = zeroField;
      if (!type || type.kind !== "record" || type.recordType !== "enum") {
        break;
      }
      if (traversedRecords.has(type.key)) {
        errors.push({
          token: originalRecord.name,
          message: "Default value has an infinite representation",
        });
        break;
      }
      const newRecord = this.recordMap.get(type.key);
      if (!newRecord) {
        break;
      }
      record = newRecord.record;
    }
  }

  private verifyValueType(
    value: MutableValue,
    expectedType: ResolvedType,
    errors: ErrorSink,
  ): boolean {
    value.type = expectedType;
    switch (expectedType.kind) {
      case "nullable": {
        if (value.kind === "literal" && value.token.text === "null") {
          return true;
        }
        return this.verifyValueType(value, expectedType.value, errors);
      }
      case "array": {
        if (value.kind !== "array") {
          errors.push({
            token: value.token,
            expected: "array",
          });
          return false;
        }
        value.items.forEach((v) =>
          this.verifyValueType(v, expectedType.item, errors)
        );
        return true;
      }
      case "record": {
        const record = this.recordMap.get(expectedType.key);
        if (!record) {
          // An error was already registered.
          return false;
        }
        return record.record.recordType === "struct"
          ? this.verifyValueStructType(value, record.record, errors)
          : this.verifyValueEnumType(value, record.record, errors);
      }
      case "primitive": {
        if (
          value.kind !== "literal" ||
          !valueHasPrimitiveType(value.token.text, expectedType.primitive)
        ) {
          errors.push({
            token: value.token,
            expected: expectedType.primitive,
          });
          return false;
        }
        return true;
      }
    }
  }

  private verifyValueEnumType(
    value: Value,
    expectedEnum: Record,
    errors: ErrorSink,
  ): boolean {
    const { token } = value;
    if (value.kind === "literal" && isStringLiteral(token.text)) {
      // The value is a string.
      // It must match the name of one of the constants defined in the enum.
      const fieldName = unquoteAndUnescape(token.text);
      const field = expectedEnum.nameToDeclaration[fieldName];
      if (!field || field.kind !== "field") {
        errors.push({
          token: token,
          message: `field not found in enum ${expectedEnum.name.text}`,
        });
        return false;
      }
      if (field.type) {
        errors.push({
          token: token,
          message: "refers to a value field",
        });
        return false;
      }
    } else if (value.kind === "object") {
      // The value is an object. It must have exactly two entries:
      //   · 'kind' must match the name of one of the value fields defined in
      //     the enum
      //   · 'value' must match the type of the value field
      const entries = { ...value.entries };
      const kindEntry = entries.kind;
      if (!kindEntry) {
        errors.push({
          token: token,
          message: "missing entry: kind",
        });
        return false;
      }
      delete entries.kind;
      const kindValueToken = kindEntry.value.token;
      if (
        kindEntry.value.kind !== "literal" ||
        !isStringLiteral(kindValueToken.text)
      ) {
        errors.push({
          token: kindValueToken,
          expected: "string",
        });
        return false;
      }
      const fieldName = unquoteAndUnescape(kindValueToken.text);
      const field = expectedEnum.nameToDeclaration[fieldName];
      if (!field || field.kind !== "field") {
        errors.push({
          token: kindValueToken,
          message: `field not found in enum ${expectedEnum.name.text}`,
        });
        return false;
      }
      if (!field.type) {
        errors.push({
          token: kindValueToken,
          message: "refers to a constant field",
        });
        return false;
      }
      const enumValue = entries.value;
      if (!enumValue) {
        errors.push({
          token: token,
          message: "missing entry: value",
        });
        return false;
      }
      delete entries.value;
      this.verifyValueType(enumValue.value, field.type, errors);
      const extraEntries = Object.values(entries);
      if (extraEntries.length !== 0) {
        const extraEntry = extraEntries[0];
        errors.push({
          token: extraEntry.name,
          message: "extraneous entry",
        });
        return false;
      }
    } else {
      // The value is neither a string nor an object. It can't be of enum type.
      errors.push({
        token: token,
        expected: "string or object",
      });
      return false;
    }
    return true;
  }

  private verifyValueStructType(
    value: Value,
    expectedStruct: Record,
    errors: ErrorSink,
  ): boolean {
    const { token } = value;
    if (value.kind !== "object") {
      errors.push({
        token: token,
        expected: "object",
      });
      return false;
    }
    for (const [fieldName, fieldEntry] of Object.entries(value.entries)) {
      const field = expectedStruct.nameToDeclaration[fieldName];
      if (!field || field.kind !== "field") {
        errors.push({
          token: fieldEntry.name,
          message: `field not found in enum ${expectedStruct.name.text}`,
        });
        return false;
      }
      if (!field.type) {
        return false;
      }
      this.verifyValueType(fieldEntry.value, field.type, errors);
    }
    return true;
  }

  private modules = new Map<string, Result<Module | null>>();
  // To detect circular dependencies.
  private readonly inProgressSet = new Set<string>();
  private readonly mutableRecordMap = new Map<RecordKey, RecordLocation>();
  private readonly mutableResolvedModules: MutableModule[] = [];
  private readonly mutableErrors: Error[] = [];

  get recordMap(): ReadonlyMap<RecordKey, RecordLocation> {
    return this.mutableRecordMap;
  }

  get resolvedModules(): ReadonlyArray<Module> {
    return this.mutableResolvedModules;
  }

  get errors(): readonly Error[] {
    return this.mutableErrors;
  }
}

class TypeResolver {
  constructor(
    private readonly module: Module,
    private readonly modules: Map<string, Result<Module | null>>,
    private readonly usedImports: Set<string>,
    private readonly errors: ErrorSink,
  ) {}

  resolve(
    input: UnresolvedType,
    recordOrigin: RecordLocation | "top-level",
  ): MutableResolvedType | undefined {
    switch (input.kind) {
      case "primitive":
        return input;
      case "array": {
        const item = this.resolve(input.item, recordOrigin);
        if (!item) {
          return undefined;
        }
        return { kind: "array", item: item, key: input.key };
      }
      case "nullable": {
        const value = this.resolve(input.value, recordOrigin);
        if (!value) {
          return undefined;
        }
        return { kind: "nullable", value: value };
      }
      case "record": {
        return this.resolveRecordRef(input, recordOrigin);
      }
    }
  }

  /**
   * Finds the definition of the actual record referenced from a value type.
   * This is where we implement the name resolution algorithm.
   */
  private resolveRecordRef(
    recordRef: UnresolvedRecordRef,
    recordOrigin: RecordLocation | "top-level",
  ): ResolvedRecordRef | undefined {
    const firstNamePart = recordRef.nameParts[0];

    // The most nested record/module which contains the first name in the record
    // reference, or the module if the record reference is absolute (starts with
    // a dot).
    let start: Record | Module | undefined;
    const { errors, module, modules, usedImports } = this;
    if (recordOrigin !== "top-level") {
      if (!recordRef.absolute) {
        // Traverse the chain of ancestors from most nested to top-level.
        for (const fromRecord of [...recordOrigin.recordAncestors].reverse()) {
          const matchMaybe = fromRecord.nameToDeclaration[firstNamePart.text];
          if (matchMaybe && matchMaybe.kind === "record") {
            start = fromRecord;
            break;
          }
        }
      }
      if (!start) {
        start = module;
      }
    } else {
      start = module;
    }

    const makeNotARecordError = (name: Token): Error => {
      return {
        token: name,
        message: "Does not refer to a struct or an enum",
      };
    };

    let it = start;
    for (let i = 0; i < recordRef.nameParts.length; ++i) {
      const namePart = recordRef.nameParts[i];
      const name = namePart.text;
      let newIt = it.nameToDeclaration[name];
      if (newIt === undefined) {
        errors.push({
          token: namePart,
          message: `Cannot find name '${name}'`,
        });
        return undefined;
      } else if (newIt.kind === "record") {
        it = newIt;
      } else if (newIt.kind === "import" || newIt.kind === "import-as") {
        const cannotReimportError: Error = {
          token: namePart,
          message: `Cannot reimport imported name '${name}'`,
        };
        if (i !== 0) {
          errors.push(cannotReimportError);
          return undefined;
        }
        usedImports.add(newIt.name.text);
        const newModulePath = getModulePath(newIt, module.path, []);
        if (newModulePath === undefined) {
          return undefined;
        }
        const newModuleResult = modules.get(newModulePath);
        if (newModuleResult === undefined || newModuleResult.result === null) {
          // The module was not found or has errors: an error was already
          // registered, no need to register a new one.
          return undefined;
        }
        const newModule = newModuleResult.result;
        if (newIt.kind === "import") {
          newIt = newModule.nameToDeclaration[name];
          if (!newIt || newIt.kind !== "record") {
            this.errors.push(
              newIt.kind === "import" || newIt.kind === "import-as"
                ? cannotReimportError
                : makeNotARecordError(namePart),
            );
            return undefined;
          }
          it = newIt;
        } else {
          it = newModule;
        }
      } else {
        this.errors.push(makeNotARecordError(namePart));
        return undefined;
      }
    }
    if (it.kind !== "record") {
      const name = recordRef.nameParts[0];
      this.errors.push(makeNotARecordError(name));
      return undefined;
    }
    return {
      kind: "record",
      key: it.key,
      recordType: it.recordType,
      refToken: recordRef.nameParts.at(-1)!,
    };
  }
}

function getModulePath(
  declaration: Import,
  originModulePath: string,
  errors: ErrorSink,
): string | undefined {
  let modulePath = unquoteAndUnescape(declaration.modulePath.text);
  if (modulePath.startsWith("./") || modulePath.startsWith("../")) {
    // This is a relative path from the module. Let's transform it into a
    // relative path from root.
    modulePath = paths.join(originModulePath, "..", modulePath);
  }
  // "a/./b/../c" => "a/c"
  modulePath = paths.normalize(modulePath);
  if (modulePath.startsWith(`..${paths.SEP}`)) {
    errors.push({
      token: declaration.modulePath,
      message: "Module path must point to a file within root",
    });
    return undefined;
  }
  return modulePath;
}

function collectModuleRecords(
  module: MutableModule,
): Map<RecordKey, MutableRecordLocation> {
  const result = new Map<RecordKey, MutableRecordLocation>();
  const collect = (
    moduleOrRecord: Module | Record,
    ancestors: readonly Record[],
  ) => {
    for (const record of moduleOrRecord.declarations) {
      if (record.kind !== "record") {
        continue;
      }
      const updatedRecordAncestors = ancestors.concat([record]);
      const modulePath = record.name.line.modulePath;
      const recordLocation: MutableRecordLocation = {
        kind: "record-location",
        record: record,
        recordAncestors: updatedRecordAncestors,
        modulePath: modulePath,
      };
      // We want depth-first.
      collect(record, updatedRecordAncestors);
      result.set(record.key, recordLocation);
    }
  };
  collect(module, []);
  return result;
}

function ensureAllImportsAreUsed(
  module: Module,
  usedImports: Set<string>,
  errors: ErrorSink,
): void {
  for (const declaration of module.declarations) {
    if (declaration.kind !== "import" && declaration.kind !== "import-as") {
      continue;
    }
    if (!usedImports.has(declaration.name.text)) {
      errors.push({
        token: declaration.name,
        message: "unused import",
      });
    }
  }
}

function freezeDeeply(o: unknown): void {
  if (!(o instanceof Object)) {
    return;
  }
  if (Object.isFrozen(o)) {
    return;
  }
  Object.freeze(o);
  for (const v of Object.values(o)) {
    freezeDeeply(v);
  }
}
