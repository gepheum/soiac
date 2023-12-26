import {
  Module,
  Procedure,
  RecordKey,
  RecordLocation,
  ResolvedType,
} from "../module.ts";
import { ModuleSet } from "../module_set.ts";
import { CodeGenerator } from "../code_generator.ts";
import { makeTransformExpression } from "./typescript/expression_maker.ts";
import {
  createRecordInfo,
  EnumInfo,
  EnumValueField,
  IndexableField,
  RecordInfo,
  StructField,
  StructInfo,
} from "./typescript/record_info.ts";
import { TsType } from "./typescript/ts_type.ts";
import { TypeSpeller } from "./typescript/type_speller.ts";
import * as paths from "https://deno.land/std@0.198.0/path/mod.ts";
import * as casing from "../casing.ts";
import { z } from "zod";

export class TypescriptCodeGenerator implements CodeGenerator<undefined> {
  readonly id = "typescript";
  readonly configType = z.undefined();

  generateCode(modules: ModuleSet): CodeGenerator.Output {
    const outputFiles: CodeGenerator.OutputFile[] = [];
    for (const module of modules.resolvedModules) {
      const tsPath = this.modulePathToTsPath(module.path);
      const tsCode = new TsModuleCodeGenerator(module, modules).generate();
      outputFiles.push({
        path: tsPath,
        code: tsCode,
      });
    }
    return { files: outputFiles };
  }

  private modulePathToTsPath(modulePath: string): string {
    return `${modulePath}.ts`;
  }
}

// Generates the code for one TypeScript module.
class TsModuleCodeGenerator {
  constructor(private readonly inModule: Module, inModules: ModuleSet) {
    this.typeSpeller = new TypeSpeller(inModules.recordMap, this.inModule);
  }

  generate(): string {
    // TODO: fix path.
    this.push(`
      // GENERATED CODE, DO NOT EDIT

      import * as $ from "soia";
      \n`);

    this.importOtherModules();

    for (const recordLocation of this.inModule.records) {
      this.defineClassesAndNamespaceForRecord(recordLocation);
    }

    if (this.inModule.procedures.length) {
      this.push(`
        ${TsModuleCodeGenerator.SEPARATOR}
        // Procedures
        ${TsModuleCodeGenerator.SEPARATOR}\n\n`);
    }
    for (const procedure of this.inModule.procedures) {
      this.defineProcedure(procedure);
    }

    // Once we have defined all the classes, we can initialize the serializers.
    if (this.inModule.records.length) {
      this.push(`
      ${TsModuleCodeGenerator.SEPARATOR}
      // Initialize the serializers
      ${TsModuleCodeGenerator.SEPARATOR}\n\n

      const _MODULE_PATH = "${this.inModule.path}";\n\n`);
    }

    for (const recordLocation of this.inModule.records) {
      this.initializeSerializer(recordLocation);
    }

    return this.joinLinesAndFixFormatting();
  }

  private importOtherModules(): void {
    const thisPath = paths.dirname(this.inModule.path);
    for (const entry of Object.entries(this.inModule.pathToImportedNames)) {
      const [path, importedNames] = entry;
      let tsPath = paths.relative(thisPath, path);
      if (!tsPath.startsWith(".")) {
        tsPath = `./${tsPath}`;
      }
      tsPath = `${tsPath}.ts`;
      if (importedNames.kind === "all") {
        const alias = importedNames.alias;
        this.push(`import * as x_${alias} from "${tsPath}";\n`);
      } else {
        const names = //
          [...importedNames.names].map((n) => `${n} as ${n}`).join(", ");
        this.push(`import { ${names} } from "${tsPath}";\n`);
      }
    }
    this.pushEol();
  }

  private defineClassesAndNamespaceForRecord(record: RecordLocation): void {
    const { typeSpeller } = this;
    const recordInfo = createRecordInfo(record, typeSpeller, this.seenRecords);
    const { className, recordType } = recordInfo;

    this.push(`
      ${TsModuleCodeGenerator.SEPARATOR}
      // ${recordType} ${className.type}
      ${TsModuleCodeGenerator.SEPARATOR}\n\n`);

    if (recordType === "struct") {
      // The mutable class must be defined before the frozen class.
      this.defineMutableClassForStruct(recordInfo, typeSpeller);
    }

    this.push(
      className.isNested ? `// Exported as '${className.type}'\n` : "export ",
    );
    const superClass = recordType === "struct"
      ? "$._FrozenBase"
      : "$._EnumBase";
    this.push(`class ${className.value} extends ${superClass} {\n`);

    if (recordType === "struct") {
      this.definePropertiesOfFrozenClassForStruct(recordInfo, typeSpeller);
    } else {
      this.definePropertiesOfClassForEnum(recordInfo, typeSpeller);
    }

    // Export the constructor of every nested class as a property of this class.
    for (const nestedRecord of record.record.nestedRecords) {
      const nestedClassName = typeSpeller.getClassName(nestedRecord.key);
      this.push(`static readonly ${nestedClassName.name} = `);
      this.push(`${nestedClassName.value};\n`);
    }

    this.push("}\n\n"); // class

    if (recordType === "struct") {
      this.defineInitFunctionForStruct(recordInfo, typeSpeller);
    }

    this.declareNamespaceForRecord(recordInfo, typeSpeller);

    // Register that we have defined this record.
    this.seenRecords.add(record.record.key);
  }

  private defineMutableClassForStruct(
    struct: StructInfo,
    typeSpeller: TypeSpeller,
  ): void {
    const {
      className,
      fields,
      fieldsWithDefaultAtInit,
      fieldsWithNoDefaultAtInit,
    } = struct;

    // Define the constructor.
    const paramName = fields.length ? "copyable" : "_";
    this.push(`// Exported as '${className.type}.Builder'\n`);
    this.push(`
      class ${className.value}_Mutable extends $._MutableBase {
        constructor(
          ${paramName}: ${className.type}.Copyable = ${className.value}.DEFAULT,
        ) {
          super();\n`);
    if (fieldsWithDefaultAtInit.length) {
      const castThis = "this as Record<string, unknown>";
      this.push(`init${className.value}(${castThis}, copyable);\n`);
    }
    // The init function does not set fields whose default value cannot be
    // obtained at class init. We do it in this loop.
    for (const field of fieldsWithNoDefaultAtInit) {
      const inExpr = `copyable.${field.property}`;
      const rvalue = makeTransformExpression({
        type: field.type,
        inExpr: inExpr,
        maybeUndefined: true,
        outFlavor: "frozen",
        typeSpeller: typeSpeller,
      });
      this.push(`this.${field.property} = ${rvalue};\n`);
    }
    this.push("Object.seal(this);\n}\n\n");

    // Declare the fields.
    for (const field of fieldsWithDefaultAtInit) {
      const type = field.tsTypes["maybe-mutable"];
      // We need the exclamation mark because these fields are initialized in
      // the init* function called from the constructor.
      this.push(`${field.property}!: ${type};\n`);
    }
    for (const field of fieldsWithNoDefaultAtInit) {
      const type = field.tsTypes["maybe-mutable"];
      this.push(`${field.property}: ${type};\n`);
    }
    this.pushEol();

    // Define the mutable getters.
    for (const field of fields) {
      this.maybeDefineMutableGetter(field, typeSpeller);
    }

    // Define the toFrozen() and toMutable() methods.
    this.push(`
      toFrozen(): ${className.type} {
        return ${className.value}.${fields.length ? "create(this)" : "DEFAULT"};
      }

      declare toMutable: () => this;\n\n`);

    // TODO: comment
    this.push("declare readonly [$._COPYABLE]: ");
    this.push(`${className.type}.Copyable | undefined;\n}\n\n`);
  }

  private definePropertiesOfFrozenClassForStruct(
    struct: StructInfo,
    typeSpeller: TypeSpeller,
  ): void {
    const {
      className,
      fields,
      fieldsWithDefaultAtInit,
      fieldsWithNoDefaultAtInit,
      indexableFields,
    } = struct;

    // Define create.
    {
      const paramName = fields.length <= 0 ? "_" : "copyable";
      this.push(`
        static create<Accept extends "partial" | "whole" = "partial">(
          ${paramName}: $.WholeOrPartial<${className.type}.Copyable, Accept>,
        ): ${className.type} {\n`);
      if (fields.length <= 0) {
        // We can greatly simplify the implementation of the function if there
        // is no field in the record.
        this.push(`return ${className.value}.DEFAULT;\n`);
      } else {
        this.push(`
          if (copyable instanceof ${className.value}) {
            return copyable;
          }
          return new ${className.value}(copyable);\n`);
      }
      this.push("}\n\n");
    }

    // Define the constructor.
    const paramName = fields.length ? "copyable" : "_";
    this.push(`
      private constructor(${paramName}: ${className.type}.Copyable) {
        super();\n`);
    if (fieldsWithDefaultAtInit.length) {
      const castThis = "this as Record<string, unknown>";
      this.push(`init${className.value}(${castThis}, copyable);\n`);
    }
    // The init function does not set fields whose default value cannot be
    // obtained at class init. We do it in this loop.
    for (const field of fieldsWithNoDefaultAtInit) {
      const inExpr = `copyable.${field.property}`;
      const rvalue = makeTransformExpression({
        type: field.type,
        inExpr: inExpr,
        maybeUndefined: false,
        outFlavor: "frozen",
        typeSpeller: typeSpeller,
      });
      this.push(`
        if (${inExpr}) {
          this._${field.property} = ${rvalue};
        }\n`);
    }
    this.push(`
        Object.freeze(this);
      }\n\n`);

    // Declare the fields.
    for (const field of fieldsWithDefaultAtInit) {
      const frozenType = field.tsTypes.frozen;
      this.push(`readonly ${field.property}!: ${frozenType};\n`);
    }
    for (const field of fieldsWithNoDefaultAtInit) {
      // When the default value is not available at class initialization, we
      // use a private property with a $ prefix, and the corresponding public
      // getter returns the default value if the private property is
      // undefined.
      const frozenType = field.tsTypes.frozen;
      const privateType = TsType.union([frozenType, TsType.UNDEFINED]);
      this.push(`private readonly _${field.property}: ${privateType};\n`);
    }
    if (indexableFields.length) {
      this.push("private __maps: {\n");
      for (const indexableField of indexableFields) {
        const { field, keyType, frozenValueType } = indexableField;
        const mapType = TsType.generic("Map", keyType, frozenValueType);
        this.push(`${field.property}?: ${mapType};\n`);
      }
      this.push("} = {};\n");
    }
    this.pushEol();

    // Define a getter for each field whose default value is not available at
    // class initialization.
    for (const field of fieldsWithNoDefaultAtInit) {
      const { property } = field;
      const frozenType = field.tsTypes.frozen;
      this.push(`
        get ${property}(): ${frozenType} {
          return this._${property} || ${frozenType}.DEFAULT;
        }\n\n`);
    }

    // Define a getter for each indexable field.
    // It performs lazy initialization of the Map.
    for (const indexableField of indexableFields) {
      this.defineMapGetter(indexableField);
    }

    // Define DEFAULT.
    this.push(`static readonly DEFAULT = new ${className.value}({});\n\n`);

    // Declare toMutable() and toFrozen().
    // They are both defined in the base class.
    // Expose the Mutable class.
    // Declare a fake property FROZEN which only exists to prevent the
    // TypeScript compiler from allowing the user to pass in a Mutable where a
    // Frozen is expected. The compiler will allow is if the Frozen class and
    // the Mutable class have the same attributes.
    // TODO: I may no longer need FROZEN...
    this.push(`
      declare toFrozen: () => this;
      declare toMutable: () => ${className.type}.Mutable;

      static readonly Mutable = ${className.value}_Mutable;

      declare private FROZEN: undefined;\n`);

    // TODO: comment
    this.push("declare readonly [$._COPYABLE]: ");
    this.push(`${className.type}.Copyable | undefined;\n\n`);

    // Define SERIALIZER. It will be initialized later.
    this.push("static readonly SERIALIZER = ");
    this.push("$._newStructSerializer(this.DEFAULT);\n\n");
  }

  private defineMapGetter(indexableField: IndexableField) {
    const { field, keyType, frozenValueType, keyExpression } = indexableField;
    const { property } = field;
    const returnType = TsType.generic("ReadonlyMap", keyType, frozenValueType);
    const lambda = `(v) => [${keyExpression}, v]`;
    this.push(`
      get ${property}Map(): ${returnType} {
        return this.__maps.${property} || (
          this.__maps.${property} = new Map(
            this.${property}.map(${lambda})
          )
        );
      }\n\n`);
  }

  private definePropertiesOfClassForEnum(
    enumInfo: EnumInfo,
    typeSpeller: TypeSpeller,
  ): void {
    const {
      className,
      enumKind,
      constantFields,
      valueFields,
      zeroField,
      enumDefaultValue,
    } = enumInfo;

    // Define the enum constants.
    for (const field of constantFields) {
      this.push(`static readonly ${field.property} = `);
      this.push(`new ${className.value}(${field.quotedName}`);
      if (enumKind !== "all-constant") {
        this.push(", undefined");
      }
      this.push(");\n");
    }
    this.pushEol();

    // Define the `create` function if the enum has value fields.
    if (enumKind !== "all-constant") {
      this.push(`
        static create<Kind extends ${className.type}.ValueKind>(
          kind: Kind,
          value: ${className.type}.CopyableFor<Kind>,
        ): ${className.type} {
          let v: ${className.type}.Value;
          switch (kind) {\n`);
      for (const field of valueFields) {
        const inExpr =
          `value as ${className.type}.CopyableFor<${field.quotedName}>`;
        const rvalue = makeTransformExpression({
          type: field.type,
          inExpr: inExpr,
          maybeUndefined: false,
          outFlavor: "frozen",
          typeSpeller: typeSpeller,
        });
        this.push(`
          case ${field.quotedName}: {
            v = ${rvalue};
            break;
          }\n`);
      }
      this.push(`
            default: {
              throw new TypeError();
            }
          }
          return new ${className.value}(kind, v);
        }\n\n`);
    }

    // Define the fromCopyable function.
    this.push(`
      static fromCopyable(
        copyable: ${className.type}.Copyable,
      ): ${className.type} {
        if (copyable instanceof ${className.value}) {
          return copyable;
        }\n`);
    if (enumKind !== "all-constant") {
      this.push(`
        if (copyable instanceof Object) {
          return this.create(copyable.kind, copyable.value);
        }\n`);
    }
    if (enumKind !== "all-value") {
      this.push("switch (copyable) {\n");
      for (const field of constantFields) {
        this.push(`
          case ${field.quotedName}: {
            return ${className.value}.${field.property};
          }\n`);
      }
      this.push("}\n"); // switch
    }
    this.push(`
        throw new TypeError();
      }\n\n`); // fromCopyable

    // Define DEFAULT.
    if (zeroField.isConstant) {
      this.push(`static readonly DEFAULT = this.${zeroField.property};\n\n`);
    } else if (enumDefaultValue.availableAtClassInit) {
      const { quotedName } = zeroField as EnumValueField;
      const { expression } = enumDefaultValue;
      const rvalue = `new this(${quotedName}, ${expression})`;
      this.push(`static readonly DEFAULT = ${rvalue};\n\n`);
    } else {
      this.push(`
        private static readonly $DEFAULT: unique symbol = Symbol();
      
        static readonly DEFAULT = new this(`);
      this.push((zeroField as EnumValueField).quotedName);
      this.push(", this.$DEFAULT);\n\n");
    }

    // Define SERIALIZER.
    this.push("static readonly SERIALIZER = ");
    this.push("$._newEnumSerializer(this.DEFAULT);\n\n");

    // Define the constructor.
    this.push(`
      private constructor(
        kind: ${className.type}.Kind,\n`);
    const valuePublicType = TsType.simple(`${className.type}.Value`);
    const valuePrivateType = enumDefaultValue.availableAtClassInit
      ? valuePublicType
      : TsType.union([
        TsType.simple(`${className.type}.Value`),
        TsType.simple(`typeof ${className.type}.$DEFAULT`),
      ]);
    if (enumKind !== "all-constant") {
      this.push(`value: ${valuePrivateType},\n`);
    }
    this.push(`
      ) {
        super();
        this.kind = kind;\n`);
    if (enumKind !== "all-constant") {
      this.push("this.");
      this.push(enumDefaultValue.availableAtClassInit ? "value " : "$value ");
      this.push("= value;\n");
    }
    this.push(`
        Object.freeze(this);
      }\n\n`); // fromCopyable

    // Declare the case and value properties.
    this.push(`readonly kind: ${className.type}.Kind;\n`);

    if (enumKind !== "all-constant") {
      if (enumDefaultValue.availableAtClassInit) {
        this.push(`
          readonly value: ${valuePublicType};\n\n`);
      } else {
        this.push(`
          private readonly $value: ${valuePrivateType};

          get value(): ${valuePublicType} {
            return this.$value === ${className.value}.$DEFAULT
              ? ${enumDefaultValue.expression}
              : this.$value;
          }\n\n`);
      }
    }

    // Define the `as` method if the enum has value fields.
    if (enumKind !== "all-constant") {
      this.push(`
        declare as: <Kind extends ${className.type}.ValueKind>(
          kind: Kind,
        ) => ${className.type}.ValueFor<Kind> | undefined;\n\n`);
    }

    // Declare the switch method. It is defined in the super class.
    const switcherType = TsType.union([
      TsType.simple(`${className.type}.Switcher<T>`),
      TsType.simple(`${className.type}.SwitcherWithFallback<T>`),
    ]);
    this.pushNoTrimStart(`
      declare switch: <T>(
        switcher: ${switcherType}
      ) => T;\n\n`);
  }

  private maybeDefineMutableGetter(
    field: StructField,
    typeSpeller: TypeSpeller,
  ): void {
    if (field.isRecursive) {
      // Only use frozen types for recursive fields.
      return;
    }
    const { mutable } = field.tsTypes;
    if (mutable.isNever) {
      // There is no mutable type for the schema type.
      return;
    }
    let type = field.type;
    let isNullable = false;
    if (type.kind === "nullable") {
      isNullable = true;
      type = type.value;
    }
    const lvalue = `this.${field.property}`;
    this.push(`get ${field.mutableGetterName}(): ${mutable} {\n`);
    if (type.kind === "array") {
      // TODO: change
      const fieldOrEmptyExpr = isNullable ? `${lvalue} || []` : lvalue;
      const asArrayExpr = `$._toMutableArray(${fieldOrEmptyExpr})`;
      this.push(`return ${lvalue} = ${asArrayExpr};\n`);
    } else if (type.kind === "record") {
      // A struct.
      const className = typeSpeller.getClassName(type.key);
      this.push(`const v = ${lvalue};\n`);
      const instanceofExpr = `v instanceof ${className.value}.Mutable`;
      const assignment = isNullable
        ? `${lvalue} = (v || ${className.value}.DEFAULT).toMutable())`
        : `${lvalue} = v.toMutable()`;
      this.push(`return ${instanceofExpr} ? v : (${assignment});\n`);
    } else {
      throw TypeError("Cannot happen");
    }
    this.push("}\n\n");
  }

  private defineInitFunctionForStruct(
    record: StructInfo,
    typeSpeller: TypeSpeller,
  ): void {
    const { className, fieldsWithDefaultAtInit } = record;
    if (!fieldsWithDefaultAtInit.length) {
      // This function would be a no-op.
      return;
    }
    this.push(`
      function init${className.value}(
        target: Record<string, unknown>,
        copyable: ${className.type}.Copyable,
      ): void {\n`);
    for (const field of fieldsWithDefaultAtInit) {
      const inExpr = `copyable.${field.property}`;
      const rvalue = makeTransformExpression({
        type: field.type,
        inExpr: inExpr,
        maybeUndefined: true,
        outFlavor: "frozen",
        typeSpeller: typeSpeller,
      });
      this.push(`target.${field.property} = ${rvalue};\n`);
    }
    this.push("}\n\n"); // function
  }

  private declareNamespaceForRecord(
    record: RecordInfo,
    typeSpeller: TypeSpeller,
  ): void {
    const { className } = record;

    this.push(`export declare namespace ${className.type} {\n`);

    if (record.recordType === "struct") {
      this.declareStructSpecificTypes(record);
    } else {
      this.declareEnumSpecificTypes(record);
    }

    // Declare a type alias for every nested class.
    for (const nestedRecord of record.nestedRecords) {
      const nestedClassName = typeSpeller.getClassName(nestedRecord);
      this.push(
        `export type ${nestedClassName.name} = ${nestedClassName.value};\n`,
      );
    }

    this.push("}\n\n"); // namespace
  }

  private declareStructSpecificTypes(
    struct: StructInfo,
  ): void {
    const { className, fields } = struct;

    // Declare the Copyable interface.
    if (fields.length) {
      this.push("export interface Copyable {\n");
      for (const field of fields) {
        const type = field.tsTypes.copyable;
        this.push(`readonly ${field.property}?: ${type};\n`);
      }
      this.push("}\n\n");
    } else {
      // The only value of type `Record<string | number | symbol, never>` is the
      // empty object `{}`.
      this.push("export type Copyable = ");
      this.push("Record<string | number | symbol, never> | OrMutable;\n\n");
    }

    // Declare the Mutable and OrMutable types.
    this.push(`
      export type Mutable = ${className.value}_Mutable;
      export type OrMutable = ${className.name} | Mutable;\n\n`);
  }

  private declareEnumSpecificTypes(
    enumInfo: EnumInfo,
  ): void {
    const {
      constantFields,
      valueFields,
      constantKindType,
      valueKindType,
      copyableType,
    } = enumInfo;

    // Declare the ConstantCase type.
    this.push(`export type ConstantKind = ${constantKindType};\n\n`);

    // Declare the CaseWithValue type.
    this.push(`export type ValueKind = ${valueKindType};\n\n`);

    // Declare the Case type.
    this.push("export type Kind = ConstantKind | ValueKind;\n\n");

    // Declare the Copyable type.
    this.push(`export type Copyable = ${copyableType};\n\n`);

    if (enumInfo.enumKind !== "all-constant") {
      // Declare the CopyableFor generic type.
      this.push("export type CopyableFor<C extends ValueKind> = ");
      this.pushNoTrimStart(`${enumInfo.copyableForType};\n\n`);

      // Declare the Value type.
      this.push(`export type Value = ${enumInfo.valueType};\n\n`);

      // Declare the ValueFor generic type.
      this.push("export type ValueFor<C extends ValueKind> = ");
      this.pushNoTrimStart(`${enumInfo.valueForType};\n\n`);
    }

    // Declare the Switcher type.
    this.push("export interface Switcher<T> {\n");
    for (const field of constantFields) {
      this.push(`${field.quotedName}: () => T;\n`);
    }
    for (const field of valueFields) {
      const { frozen } = field.tsTypes;
      this.push(`${field.quotedName}: (v: ${frozen}) => T;\n`);
    }
    this.push("}\n\n");
    this.push(`
      export interface SwitcherWithFallback<T> extends Partial<Switcher<T>> {
        fallbackTo: () => T;
      }\n\n`);
  }

  private defineProcedure(procedure: Procedure): void {
    const { typeSpeller } = this;
    const { number, requestType, responseType } = procedure;
    const name = procedure.name.text;
    const varName = casing.convert(name, "UpperCamel", "UPPER_UNDERSCORE");
    const reqTsType = typeSpeller.getTsType(requestType!, "frozen", false);
    const respTsType = typeSpeller.getTsType(responseType!, "frozen", false);
    const reqSerializer = this.getSerializerExpr(requestType!);
    const respSerializer = this.getSerializerExpr(responseType!);
    this.push(`
        export const ${varName}: $.Procedure<${reqTsType}, ${respTsType}> = {
          name: "${name}",
          number: ${number},
          requestSerializer: ${reqSerializer},
          responseSerializer: ${respSerializer},
      };\n\n`);
  }

  private initializeSerializer(record: RecordLocation): void {
    const { typeSpeller } = this;
    const recordInfo = createRecordInfo(record, typeSpeller, this.seenRecords);

    if (recordInfo.recordType === "struct") {
      this.initializeSerializerForStruct(recordInfo);
    } else {
      this.initializeSerializerForEnum(recordInfo);
    }
  }

  private initializeSerializerForStruct(struct: StructInfo): void {
    const { className, fields } = struct;
    const parentType = className.parentClassValue
      ? `${className.parentClassValue}.SERIALIZER.typeDescriptor`
      : "undefined";
    this.push(
      `$._initStructSerializer(
         ${className.value}.SERIALIZER,
         "${className.recordName}",
         "${className.recordQualifiedName}",
         _MODULE_PATH,
         ${parentType},
         [\n`,
    );
    for (const field of fields) {
      const fieldSerializer = this.getSerializerExpr(field.type);
      const tuple = [
        JSON.stringify(field.originalName),
        JSON.stringify(field.property),
        field.number,
        fieldSerializer,
      ];
      this.push(`[${tuple.join(", ")}],\n`);
    }
    this.push(`],\n[${struct.removedNumbers.join(", ")}],\n);\n\n`);
  }

  private initializeSerializerForEnum(enumInfo: EnumInfo): void {
    const { className, constantFields, valueFields } = enumInfo;
    const parentType = className.parentClassValue
      ? `${className.parentClassValue}.SERIALIZER.typeDescriptor`
      : "undefined";
    this.push(
      `$._initEnumSerializer(
         ${className.value}.SERIALIZER,
         "${className.recordName}",
         "${className.recordQualifiedName}",
         _MODULE_PATH,
         ${parentType},
         [\n`,
    );
    for (const field of constantFields) {
      const tuple = [
        field.quotedName,
        field.number,
        `${className.value}.${field.property}`,
      ];
      this.push(`[${tuple.join(", ")}],\n`);
    }
    for (const field of valueFields) {
      const fieldSerializer = this.getSerializerExpr(field.type);
      const tuple = [field.quotedName, field.number, fieldSerializer];
      this.push(`[${tuple.join(", ")}],`);
    }
    this.push(`\n],\n[${enumInfo.removedNumbers.join(", ")}],\n);\n\n`);
  }

  private getSerializerExpr(
    type: ResolvedType,
  ): string {
    if (type.kind === "record") {
      const className = this.typeSpeller.getClassName(type.key);
      return `${className.value}.SERIALIZER`;
    } else if (type.kind === "array") {
      const other = this.getSerializerExpr(type.item);
      return `$.arraySerializer(${other})`;
    } else if (type.kind === "nullable") {
      const other = this.getSerializerExpr(type.value);
      return `$.nullableSerializer(${other})`;
    } else if (type.kind === "primitive") {
      return `$.primitiveSerializer("${type.primitive}")`;
    }
    const _: never = type;
    throw TypeError();
  }

  private static readonly SEPARATOR = `// ${"-".repeat(80 - "// ".length)}`;

  private push(code: string): void {
    this.code += code.trimStart();
  }

  private pushNoTrimStart(code: string): void {
    this.code += code;
  }

  private pushEol(): void {
    this.code += "\n";
  }

  private joinLinesAndFixFormatting(): string {
    const indentUnit = "  ";
    let result = "";
    // The indent at every line is obtained by repeating indentUnit N times,
    // where N is the length of this array.
    const contextStack: Array<"{" | "(" | "[" | "<" | ":" | "."> = [];
    // Returns the last element in `contextStack`.
    const peakTop = () => contextStack.at(-1)!;
    const getMatchingLeftBracket = (r: "}" | ")" | "]" | ">") => {
      switch (r) {
        case "}":
          return "{";
        case ")":
          return "(";
        case "]":
          return "[";
        case ">":
          return "<";
      }
    };
    for (let line of this.code.split("\n")) {
      line = line.trim();
      if (line.length <= 0) {
        // Don't indent empty lines.
        result += "\n";
        continue;
      }

      const firstChar = line[0];
      const lastChar = line.slice(-1);
      switch (firstChar) {
        case "}":
        case ")":
        case "]":
        case ">": {
          const left = getMatchingLeftBracket(firstChar);
          while (contextStack.pop() !== left) {
            if (contextStack.length <= 0) {
              throw Error();
            }
          }
          break;
        }
        case ".": {
          if (peakTop() !== ".") {
            contextStack.push(".");
          }
          break;
        }
      }
      const indent = indentUnit.repeat(contextStack.length);
      result += `${indent}${line.trimEnd()}\n`;
      switch (lastChar) {
        case "{":
        case "(":
        case "[":
        case "<": {
          // The next line will be indented
          contextStack.push(lastChar);
          break;
        }
        case ":":
        case "=": {
          if (peakTop() !== ":") {
            contextStack.push(":");
          }
          break;
        }
        case ";":
        case ",": {
          if (peakTop() === "." || peakTop() === ":") {
            contextStack.pop();
          }
        }
      }
    }

    return result
      // Remove spaces enclosed within round bracket if that's all there is.
      .replaceAll(/\{\s+\}/g, "{}")
      // Remove spaces enclosed within square bracket if that's all there is.
      .replaceAll(/\(\s+\)/g, "()")
      // Remove empty line following an open square bracket.
      .replaceAll(/(\{\n *)\n/g, "$1")
      // Remove empty line preceding a closed square bracket.
      .replaceAll(/\n(\n *\})/g, "$1")
      // Coalesce consecutive empty lines.
      .replaceAll(/\n\n\n+/g, "\n\n");
  }

  private readonly typeSpeller: TypeSpeller;
  private code = "";
  private readonly seenRecords = new Set<RecordKey>();
}
