import {
  Field,
  PrimitiveType,
  RecordKey,
  RecordLocation,
  ResolvedRecordRef,
  ResolvedType,
} from "../../module.ts";
import { capitalize, convert } from "../../casing.ts";
import { ClassName } from "./class_speller.ts";
import { TsType } from "./ts_type.ts";
import { TYPE_FLAVORS, TypeFlavor, TypeSpeller } from "./type_speller.ts";

/**
 * A `RecordInfo` contains all the information required for generating
 * TypeScript classes for a given struct or enum.
 */
export type RecordInfo = StructInfo | EnumInfo;

export interface StructInfo {
  readonly recordType: "struct";
  readonly className: ClassName;
  readonly nestedRecords: readonly RecordKey[];
  readonly removedNumbers: readonly number[];

  /** Fields sorted by number. */
  readonly fields: readonly StructField[];

  /**
   * Subset of the fields for which we can obtain a default value at the time
   * the frozen class is initialized.
   */
  readonly fieldsWithDefaultAtInit: readonly StructField[];
  /**
   * Subset of the fields for which we can NOT obtain a default value at the
   * time the frozen class is initialized. Reason: the type of the field is a
   * class which was initialized yet.
   */
  readonly fieldsWithNoDefaultAtInit: readonly StructField[];
  /** Subset of the fields with array type and a key for indexing. */
  readonly indexableFields: readonly IndexableField[];
}

export interface EnumInfo {
  readonly recordType: "enum";
  readonly className: ClassName;
  readonly nestedRecords: readonly RecordKey[];
  readonly removedNumbers: readonly number[];

  readonly enumKind: "all-constant" | "all-value" | "mixed";
  readonly constantFields: readonly EnumConstantField[];
  readonly valueFields: readonly EnumValueField[];
  readonly zeroField: EnumField;
  readonly constantKindType: TsType;
  readonly valueKindType: TsType;
  /**
   * Union of the frozen type of all the value fields, or `never` if there is no
   * frozen field.
   */
  readonly valueType: TsType;
  readonly valueForType: TsType;
  readonly copyableType: TsType;
  readonly copyableForType: TsType;
  /**
   * If the zero field is a constant field, this is a reference to the constant.
   * Otherwise, this is the default value of the zero field.
   */
  readonly enumDefaultValue: DefaultValue;
}

export interface StructField {
  // Name of the generated property for this field, in lowerCamel format.
  // Note that it might be a typescript keyword, because TypeScript allows
  // property names to be keywords.
  readonly property: string;
  // Name of the field as it appears in the `.soia` file, in lower_case format.
  // You probably meant to use `property`.
  readonly originalName: string;
  // Name of the mutableX() generated method in the Mutable class.
  readonly mutableGetterName: string;
  readonly number: number;
  // Schema field type, e.g. `int32`.
  readonly type: ResolvedType;
  // True if the field type depends on the struct where the field is defined.
  readonly isRecursive: boolean;
  // Matching TypeScript type for each type flavor.
  readonly tsTypes: Readonly<Record<TypeFlavor, TsType>>;
  readonly defaultValue: DefaultValue;
}

export interface IndexableField {
  field: StructField;
  keyType: TsType;
  /** The key expression. References the value as `v`. */
  keyExpression: string;
  frozenValueType: TsType;
}

export type EnumField = EnumConstantField | EnumValueField;

// Information about a constant field within an enum.
export interface EnumConstantField {
  // To distinguish from EnumValueField.
  readonly isConstant: true;

  // Name of the field as it appears in the `.soia` file, in UPPER_CASE format.
  readonly name: string;
  // TypeScript string literal of `Kind` type.
  // Same as `"${name}"`.
  readonly quotedName: string;
  // Name of the generated static readonly property for this field.
  // In UPPER_CASE format.
  // It is either the name as-is or the result of appending an underscore to the
  // name if the name conflicts with another generated property.
  readonly property: string;
  readonly number: number;
}

export interface EnumValueField {
  // To distinguish from EnumConstantField.
  readonly isConstant: false;

  // Name of the field as it appears in the `.soia` file, in lower_case format.
  readonly name: string;
  // TypeScript string literal of `Kind` type.
  // Same as `"${name}"`.
  readonly quotedName: string;
  readonly number: number;
  // Schema field type, e.g. `int32`.
  readonly type: ResolvedType;
  // True if the field type depends on the struct where the field is defined.
  readonly isRecursive: boolean;
  // Matching TypeScript type for each type flavor.
  readonly tsTypes: Readonly<Record<TypeFlavor, TsType>>;
  readonly defaultValue: DefaultValue;
}

export interface DefaultValue {
  readonly expression: string;
  // Whether the expression is legal when the class is being initialized.
  // False if the expression calls the property of a class which has not yet
  // been initialized.
  readonly availableAtClassInit: boolean;
}

export function createRecordInfo(
  record: RecordLocation,
  typeSpeller: TypeSpeller,
  alreadyInitialized: ReadonlySet<RecordKey>,
): RecordInfo {
  return new RecordInfoCreator(record, typeSpeller, alreadyInitialized)
    .create();
}

class RecordInfoCreator {
  constructor(
    private readonly record: RecordLocation,
    private readonly typeSpeller: TypeSpeller,
    private readonly alreadyInitialized: ReadonlySet<RecordKey>,
  ) {
    this.className = this.typeSpeller.getClassName(record.record.key);
  }

  private readonly className: ClassName;

  create(): RecordInfo {
    const { recordType } = this.record.record;
    if (recordType === "struct") {
      return this.createStructInfo();
    } else {
      return this.createEnumInfo();
    }
  }

  private createStructInfo(): StructInfo {
    const { record } = this.record;

    const fields: StructField[] = [];
    const indexableFields: IndexableField[] = [];
    for (const field of record.fields) {
      const structField = this.createStructField(field);
      fields.push(structField);
      const { type } = structField;
      let keyType: ActualKeyType | undefined;
      if (
        type.kind === "array" && type.key &&
        (keyType = this.getActualKeyType(type.key.keyType))
      ) {
        const { key } = type;
        const frozenValueType = this.typeSpeller.getTsType(
          type.item,
          "frozen",
          false,
        );
        const propertiesChain = key.fieldNames.map((n) => {
          const desiredName = convert(n.text, "lower_underscore", "lowerCamel");
          return getStructFieldProperty(desiredName);
        }).join(".");
        const keyExpression = keyType!.extractKey(`v.${propertiesChain}`);
        indexableFields.push({
          field: structField,
          keyType: keyType.keyType,
          keyExpression: keyExpression,
          frozenValueType: frozenValueType,
        });
      }
    }

    // Sort fields by number.
    fields.sort((a, b) => a.number - b.number);

    return {
      recordType: "struct",
      className: this.className,
      nestedRecords: record.nestedRecords.map((r) => r.key),
      removedNumbers: record.removedNumbers.slice(),
      fields: fields,
      fieldsWithDefaultAtInit: fields.filter((f) =>
        f.defaultValue.availableAtClassInit
      ),
      fieldsWithNoDefaultAtInit: fields.filter((f) =>
        !f.defaultValue.availableAtClassInit
      ),
      indexableFields: indexableFields,
    };
  }

  private createStructField(field: Field): StructField {
    const { type } = field;
    if (!type) {
      throw TypeError();
    }
    const originalName = field.name.text;
    const desiredName = convert(originalName, "lower_underscore", "lowerCamel");
    const property = getStructFieldProperty(desiredName);
    const mutableGetterName = `mutable${capitalize(desiredName)}`;
    return {
      property: property,
      originalName: originalName,
      mutableGetterName: mutableGetterName,
      number: field.number,
      type: type,
      isRecursive: field.isRecursive,
      tsTypes: this.getTsTypes(field),
      defaultValue: this.getDefaultValue(type),
    };
  }

  private createEnumInfo(): EnumInfo {
    const { className } = this;
    const { record } = this.record;
    const constantFields: EnumConstantField[] = [];
    const valueFields: EnumValueField[] = [];
    let zeroField: EnumField | undefined;
    const typesInConstantKindUnion: TsType[] = [];
    const typesInValueKindUnion: TsType[] = [];
    const typesInValueTypeUnion: TsType[] = [];
    const nameToValueType = new Map<string, TsType>();
    const typesInCopyableUnion: TsType[] = [];
    const nameToCopyableType = new Map<string, TsType>();

    typesInCopyableUnion.push(TsType.simple(className.type));

    for (const field of record.fields) {
      const { type } = field;
      let enumField: EnumField;
      if (type === undefined) {
        // A constant field.
        enumField = this.createEnumConstantField(field);
        constantFields.push(enumField);
        const nameLiteral = TsType.literal(enumField.name);
        typesInConstantKindUnion.push(nameLiteral);
        typesInCopyableUnion.push(nameLiteral);
      } else {
        // A value field.
        enumField = this.createEnumValueField(field);
        const { name } = enumField;
        const nameLiteral = TsType.literal(name);
        const { frozen, copyable } = enumField.tsTypes;
        valueFields.push(enumField);
        typesInValueKindUnion.push(nameLiteral);
        typesInValueTypeUnion.push(frozen);
        typesInCopyableUnion.push(TsType.inlineInterface({
          kind: nameLiteral,
          value: copyable,
        }));
        nameToValueType.set(name, frozen);
        nameToCopyableType.set(name, copyable);
      }
      if (enumField.number === 0) {
        zeroField = enumField;
      }
    }

    const enumKind = constantFields.length
      ? (valueFields.length ? "mixed" : "all-constant")
      : "all-value";

    if (enumKind !== "all-constant") {
      typesInValueTypeUnion.push(TsType.UNDEFINED);
    }

    const enumDefaultValue = zeroField!.isConstant
      ? {
        expression: `${className.value}.${zeroField!.property}`,
        availableAtClassInit: true,
      }
      : zeroField!.defaultValue;

    return {
      recordType: "enum",
      className: className,
      nestedRecords: record.nestedRecords.map((r) => r.key),
      removedNumbers: record.removedNumbers.slice(),
      enumKind: enumKind,
      constantFields: constantFields,
      valueFields: valueFields,
      zeroField: zeroField!,
      constantKindType: TsType.union(typesInConstantKindUnion),
      valueKindType: TsType.union(typesInValueKindUnion),
      valueType: TsType.union(typesInValueTypeUnion),
      valueForType: TsType.conditional("C", nameToValueType),
      copyableType: TsType.union(typesInCopyableUnion),
      copyableForType: TsType.conditional("C", nameToCopyableType),
      enumDefaultValue: enumDefaultValue,
    };
  }

  private createEnumConstantField(field: Field): EnumConstantField {
    const name = field.name.text;
    const quotedName = `"${name}"`;
    const property = getEnumFieldProperty(name);
    return {
      isConstant: true,
      name: name,
      quotedName: quotedName,
      property: property,
      number: field.number,
    };
  }

  private createEnumValueField(field: Field): EnumValueField {
    const { type } = field;
    if (!type) {
      throw new TypeError();
    }
    const name = field.name.text;
    const quotedName = `"${name}"`;
    return {
      isConstant: false,
      name: name,
      quotedName: quotedName,
      number: field.number,
      type: type,
      isRecursive: field.isRecursive,
      tsTypes: this.getTsTypes(field),
      defaultValue: this.getDefaultValue(type),
    };
  }

  private getTsTypes(field: Field): Record<TypeFlavor, TsType> {
    const { type } = field;
    if (!type) {
      throw new TypeError();
    }
    const allRecordsFrozen = field.isRecursive;
    const tsTypes = {} as Record<TypeFlavor, TsType>;
    for (const flavor of TYPE_FLAVORS) {
      const tsType = this.typeSpeller.getTsType(type, flavor, allRecordsFrozen);
      tsTypes[flavor] = tsType;
    }
    return tsTypes;
  }

  private getDefaultValue(type: ResolvedType): DefaultValue {
    return {
      expression: this.getDefaultValueExpression(type),
      availableAtClassInit: this.canGetDefaultValueAtClassInit(type),
    };
  }

  private getDefaultValueExpression(type: ResolvedType): string {
    switch (type.kind) {
      case "record": {
        const className = this.typeSpeller.getClassName(type.key);
        return `${className.value}.DEFAULT`;
      }
      case "array":
        return "$.Internal.EMPTY_ARRAY";
      case "nullable":
        return "null";
      case "primitive": {
        const { primitive } = type;
        switch (primitive) {
          case "bool":
            return "false";
          case "int32":
          case "int64":
          case "uint64":
          case "float32":
          case "float64":
            return "0";
          case "timestamp":
            return "$.Timestamp.UNIX_EPOCH";
          case "string":
            return '""';
          case "bytes":
            return "$.ByteString.EMPTY";
        }
      }
    }
  }

  private canGetDefaultValueAtClassInit(type: ResolvedType): boolean {
    if (type.kind !== "record") {
      // The problem only exists if the field has record type.
      return true;
    }
    const module = this.typeSpeller.recordMap.get(type.key)!;
    if (module.modulePath !== this.record.modulePath) {
      // The type is defined in another module: we're fine because there can't
      // be a cyclic dependency between modules.
      return true;
    }
    return this.alreadyInitialized.has(type.key);
  }

  /**
   * Returns information about the `K` in a `ReadonlyMap<K, Item>` obtained when
   * indexing an array. It is not always the type of the key field specified in
   * the `.soia` file. For example, if the key field specified in the `.soia`
   * file has type `int64`, we want the actual key type to be `string` because
   * `bigint` is not indexable.
   */
  getActualKeyType(
    type: PrimitiveType | ResolvedRecordRef,
  ): ActualKeyType | undefined {
    switch (type.kind) {
      case "primitive":
        switch (type.primitive) {
          case "bool":
          case "int32":
          case "float32":
          case "float64":
          case "string":
            return {
              keyType: this.typeSpeller.getTsType(type, "frozen", true),
              extractKey: (e: string) => e,
            };
          case "int64":
          case "uint64":
            return {
              keyType: TsType.STRING,
              extractKey: (e: string) => `${e}.toString()`,
            };
        }
        return undefined;
      case "record": {
        const enumType = this.typeSpeller.getTsType(type, "frozen", true);
        return {
          keyType: TsType.simple(`${enumType}.Kind`),
          extractKey: (e: string) => `${e}.kind`,
        };
      }
    }
  }
}

// Only care about properties in lowerCamel format.
const STRUCT_COMMON_GENERATED_PROPERTIES: ReadonlySet<string> = new Set([
  "toFrozen",
  "toMutable",
]);

// Only care about properties in UPPER_CASE format.
const ENUM_COMMON_GENERATED_PROPERTIES: ReadonlySet<string> = new Set([
  "DEFAULT",
  "SERIALIZER",
]);

/**
 * Returns the name of the TypeScript property for the given struct field.
 * Expects a field name as it appears in the `.soia` file.
 */
export function structFieldNameToProperty(fieldName: string): string {
  return getStructFieldProperty(
    convert(fieldName, "lower_underscore", "lowerCamel"),
  );
}

// Returns the name of the TypeScript property for the given struct field.
// Obtained by appending a "_" suffix to the desired name if it conflicts with a
// common generated property.
function getStructFieldProperty(desiredName: string): string {
  return /^mutable[0-9A-Z]/.test(desiredName) || desiredName.endsWith("Map") ||
      STRUCT_COMMON_GENERATED_PROPERTIES.has(desiredName)
    ? `${desiredName}_`
    : desiredName;
}

// Returns the name of the static readonly TypeScript property for the given
// constant enum field.
// Obtained by appending a "_" suffix to the desired name if it conflicts with a
// common generated property.
function getEnumFieldProperty(desiredName: string): string {
  return ENUM_COMMON_GENERATED_PROPERTIES.has(desiredName)
    ? `${desiredName}_`
    : desiredName;
}

/**
 * Information about the `K` in a `ReadonlyMap<K, Item>` obtained when
 * indexing an array. It is not always the type of the key field specified in
 * the `.soia` file. For example, if the key field specified in the `.soia` file
 * has type `int64`, we want the actual key type to be `string` because `bigint`
 * is not indexable.
 */
interface ActualKeyType {
  keyType: TsType;
  /**
   * Expects a field path expression, for example `e.id`, and returns a key
   * expression of type K, for example `e.id` if the type of `id` is string, or
   * `e.id.toString()` if the type of `id` is int64.
   */
  extractKey: (e: string) => string;
}
