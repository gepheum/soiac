// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

// -----------------------------------------------------------------------------
// enum Weekday
// -----------------------------------------------------------------------------

export class Weekday extends $._EnumBase {
  static readonly MONDAY = new Weekday("MONDAY");
  static readonly TUESDAY = new Weekday("TUESDAY");
  static readonly WEDNESDAY = new Weekday("WEDNESDAY");
  static readonly THURSDAY = new Weekday("THURSDAY");
  static readonly FRIDAY = new Weekday("FRIDAY");
  static readonly SATURDAY = new Weekday("SATURDAY");
  static readonly SUNDAY = new Weekday("SUNDAY");

  static fromCopyable(
    copyable: Weekday.Copyable,
  ): Weekday {
    if (copyable instanceof Weekday) {
      return copyable;
    }
    switch (copyable) {
      case "MONDAY": {
        return Weekday.MONDAY;
      }
      case "TUESDAY": {
        return Weekday.TUESDAY;
      }
      case "WEDNESDAY": {
        return Weekday.WEDNESDAY;
      }
      case "THURSDAY": {
        return Weekday.THURSDAY;
      }
      case "FRIDAY": {
        return Weekday.FRIDAY;
      }
      case "SATURDAY": {
        return Weekday.SATURDAY;
      }
      case "SUNDAY": {
        return Weekday.SUNDAY;
      }
    }
    throw new TypeError();
  }

  static readonly DEFAULT = this.MONDAY;

  static readonly SERIALIZER = $._newEnumSerializer(this.DEFAULT);

  private constructor(
    kind: Weekday.Kind,
  ) {
    super();
    this.kind = kind;
    Object.freeze(this);
  }

  readonly kind: Weekday.Kind;

  declare switch: <T>(
    switcher:
      | Weekday.Switcher<T>
      | Weekday.SwitcherWithFallback<T>,
  ) => T;
}

export declare namespace Weekday {
  export type ConstantKind =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  export type ValueKind = never;

  export type Kind = ConstantKind | ValueKind;

  export type Copyable =
    | Weekday
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  export interface Switcher<T> {
    "MONDAY": () => T;
    "TUESDAY": () => T;
    "WEDNESDAY": () => T;
    "THURSDAY": () => T;
    "FRIDAY": () => T;
    "SATURDAY": () => T;
    "SUNDAY": () => T;
  }

  export interface SwitcherWithFallback<T> extends Partial<Switcher<T>> {
    fallbackTo: () => T;
  }
}

// -----------------------------------------------------------------------------
// struct JsonValue.Pair
// -----------------------------------------------------------------------------

// Exported as 'JsonValue.Pair.Builder'
class JsonValue_Pair_Mutable extends $._MutableBase {
  constructor(
    copyable: JsonValue.Pair.Copyable = JsonValue_Pair.DEFAULT,
  ) {
    super();
    initJsonValue_Pair(this as Record<string, unknown>, copyable);
    this.value = JsonValue.fromCopyable(copyable.value || JsonValue.DEFAULT);
    Object.seal(this);
  }

  name!: string;
  value: JsonValue;

  toFrozen(): JsonValue.Pair {
    return JsonValue_Pair.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: JsonValue.Pair.Copyable | undefined;
}

// Exported as 'JsonValue.Pair'
class JsonValue_Pair extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<JsonValue.Pair.Copyable, Accept>,
  ): JsonValue.Pair {
    if (copyable instanceof JsonValue_Pair) {
      return copyable;
    }
    return new JsonValue_Pair(copyable);
  }

  private constructor(copyable: JsonValue.Pair.Copyable) {
    super();
    initJsonValue_Pair(this as Record<string, unknown>, copyable);
    if (copyable.value) {
      this._value = JsonValue.fromCopyable(copyable.value);
    }
    Object.freeze(this);
  }

  readonly name!: string;
  private readonly _value: JsonValue | undefined;

  get value(): JsonValue {
    return this._value || JsonValue.DEFAULT;
  }

  static readonly DEFAULT = new JsonValue_Pair({});

  declare toFrozen: () => this;
  declare toMutable: () => JsonValue.Pair.Mutable;

  static readonly Mutable = JsonValue_Pair_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: JsonValue.Pair.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initJsonValue_Pair(
  target: Record<string, unknown>,
  copyable: JsonValue.Pair.Copyable,
): void {
  target.name = copyable.name || "";
}

export declare namespace JsonValue.Pair {
  export interface Copyable {
    readonly name?: string;
    readonly value?: JsonValue.Copyable;
  }

  export type Mutable = JsonValue_Pair_Mutable;
  export type OrMutable = Pair | Mutable;
}

// -----------------------------------------------------------------------------
// enum JsonValue
// -----------------------------------------------------------------------------

export class JsonValue extends $._EnumBase {
  static readonly NULL = new JsonValue("NULL", undefined);

  static create<Kind extends JsonValue.ValueKind>(
    kind: Kind,
    value: JsonValue.CopyableFor<Kind>,
  ): JsonValue {
    let v: JsonValue.Value;
    switch (kind) {
      case "boolean": {
        v = value as JsonValue.CopyableFor<"boolean">;
        break;
      }
      case "number": {
        v = value as JsonValue.CopyableFor<"number">;
        break;
      }
      case "string": {
        v = value as JsonValue.CopyableFor<"string">;
        break;
      }
      case "array": {
        v = $._toFrozenArray(
          value as JsonValue.CopyableFor<"array">,
          (e) => JsonValue.fromCopyable(e),
        );
        break;
      }
      case "object": {
        v = $._toFrozenArray(
          value as JsonValue.CopyableFor<"object">,
          (e) => JsonValue_Pair.create(e),
        );
        break;
      }
      default: {
        throw new TypeError();
      }
    }
    return new JsonValue(kind, v);
  }

  static fromCopyable(
    copyable: JsonValue.Copyable,
  ): JsonValue {
    if (copyable instanceof JsonValue) {
      return copyable;
    }
    if (copyable instanceof Object) {
      return this.create(copyable.kind, copyable.value);
    }
    switch (copyable) {
      case "NULL": {
        return JsonValue.NULL;
      }
    }
    throw new TypeError();
  }

  static readonly DEFAULT = this.NULL;

  static readonly SERIALIZER = $._newEnumSerializer(this.DEFAULT);

  private constructor(
    kind: JsonValue.Kind,
    value: JsonValue.Value,
  ) {
    super();
    this.kind = kind;
    this.value = value;
    Object.freeze(this);
  }

  readonly kind: JsonValue.Kind;
  readonly value: JsonValue.Value;

  declare as: <Kind extends JsonValue.ValueKind>(
    kind: Kind,
  ) => JsonValue.ValueFor<Kind> | undefined;

  declare switch: <T>(
    switcher:
      | JsonValue.Switcher<T>
      | JsonValue.SwitcherWithFallback<T>,
  ) => T;

  static readonly Pair = JsonValue_Pair;
}

export declare namespace JsonValue {
  export type ConstantKind = "NULL";

  export type ValueKind =
    | "boolean"
    | "number"
    | "string"
    | "array"
    | "object";

  export type Kind = ConstantKind | ValueKind;

  export type Copyable =
    | JsonValue
    | "NULL"
    | { kind: "boolean"; value: boolean }
    | { kind: "number"; value: number }
    | { kind: "string"; value: string }
    | { kind: "array"; value: ReadonlyArray<JsonValue.Copyable> }
    | { kind: "object"; value: ReadonlyArray<JsonValue.Pair.Copyable> };

  export type CopyableFor<C extends ValueKind> = C extends "boolean" ? boolean
    : C extends "number" ? number
    : C extends "string" ? string
    : C extends "array" ? ReadonlyArray<JsonValue.Copyable>
    : C extends "object" ? ReadonlyArray<JsonValue.Pair.Copyable>
    : never;

  export type Value =
    | boolean
    | number
    | string
    | ReadonlyArray<JsonValue>
    | ReadonlyArray<JsonValue.Pair>
    | undefined;

  export type ValueFor<C extends ValueKind> = C extends "boolean" ? boolean
    : C extends "number" ? number
    : C extends "string" ? string
    : C extends "array" ? ReadonlyArray<JsonValue>
    : C extends "object" ? ReadonlyArray<JsonValue.Pair>
    : never;

  export interface Switcher<T> {
    "NULL": () => T;
    "boolean": (v: boolean) => T;
    "number": (v: number) => T;
    "string": (v: string) => T;
    "array": (v: ReadonlyArray<JsonValue>) => T;
    "object": (v: ReadonlyArray<JsonValue.Pair>) => T;
  }

  export interface SwitcherWithFallback<T> extends Partial<Switcher<T>> {
    fallbackTo: () => T;
  }

  export type Pair = JsonValue_Pair;
}

// -----------------------------------------------------------------------------
// struct EnumWithRecursiveDefault.S
// -----------------------------------------------------------------------------

// Exported as 'EnumWithRecursiveDefault.S.Builder'
class EnumWithRecursiveDefault_S_Mutable extends $._MutableBase {
  constructor(
    copyable: EnumWithRecursiveDefault.S.Copyable =
      EnumWithRecursiveDefault_S.DEFAULT,
  ) {
    super();
    this.f = EnumWithRecursiveDefault.fromCopyable(
      copyable.f || EnumWithRecursiveDefault.DEFAULT,
    );
    Object.seal(this);
  }

  f: EnumWithRecursiveDefault;

  toFrozen(): EnumWithRecursiveDefault.S {
    return EnumWithRecursiveDefault_S.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]:
    | EnumWithRecursiveDefault.S.Copyable
    | undefined;
}

// Exported as 'EnumWithRecursiveDefault.S'
class EnumWithRecursiveDefault_S extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<EnumWithRecursiveDefault.S.Copyable, Accept>,
  ): EnumWithRecursiveDefault.S {
    if (copyable instanceof EnumWithRecursiveDefault_S) {
      return copyable;
    }
    return new EnumWithRecursiveDefault_S(copyable);
  }

  private constructor(copyable: EnumWithRecursiveDefault.S.Copyable) {
    super();
    if (copyable.f) {
      this._f = EnumWithRecursiveDefault.fromCopyable(copyable.f);
    }
    Object.freeze(this);
  }

  private readonly _f: EnumWithRecursiveDefault | undefined;

  get f(): EnumWithRecursiveDefault {
    return this._f || EnumWithRecursiveDefault.DEFAULT;
  }

  static readonly DEFAULT = new EnumWithRecursiveDefault_S({});

  declare toFrozen: () => this;
  declare toMutable: () => EnumWithRecursiveDefault.S.Mutable;

  static readonly Mutable = EnumWithRecursiveDefault_S_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]:
    | EnumWithRecursiveDefault.S.Copyable
    | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace EnumWithRecursiveDefault.S {
  export interface Copyable {
    readonly f?: EnumWithRecursiveDefault.Copyable;
  }

  export type Mutable = EnumWithRecursiveDefault_S_Mutable;
  export type OrMutable = S | Mutable;
}

// -----------------------------------------------------------------------------
// enum EnumWithRecursiveDefault
// -----------------------------------------------------------------------------

export class EnumWithRecursiveDefault extends $._EnumBase {
  static create<Kind extends EnumWithRecursiveDefault.ValueKind>(
    kind: Kind,
    value: EnumWithRecursiveDefault.CopyableFor<Kind>,
  ): EnumWithRecursiveDefault {
    let v: EnumWithRecursiveDefault.Value;
    switch (kind) {
      case "f": {
        v = EnumWithRecursiveDefault_S.create(
          value as EnumWithRecursiveDefault.CopyableFor<"f">,
        );
        break;
      }
      default: {
        throw new TypeError();
      }
    }
    return new EnumWithRecursiveDefault(kind, v);
  }

  static fromCopyable(
    copyable: EnumWithRecursiveDefault.Copyable,
  ): EnumWithRecursiveDefault {
    if (copyable instanceof EnumWithRecursiveDefault) {
      return copyable;
    }
    if (copyable instanceof Object) {
      return this.create(copyable.kind, copyable.value);
    }
    throw new TypeError();
  }

  static readonly DEFAULT = new this("f", EnumWithRecursiveDefault_S.DEFAULT);

  static readonly SERIALIZER = $._newEnumSerializer(this.DEFAULT);

  private constructor(
    kind: EnumWithRecursiveDefault.Kind,
    value: EnumWithRecursiveDefault.Value,
  ) {
    super();
    this.kind = kind;
    this.value = value;
    Object.freeze(this);
  }

  readonly kind: EnumWithRecursiveDefault.Kind;
  readonly value: EnumWithRecursiveDefault.Value;

  declare as: <Kind extends EnumWithRecursiveDefault.ValueKind>(
    kind: Kind,
  ) => EnumWithRecursiveDefault.ValueFor<Kind> | undefined;

  declare switch: <T>(
    switcher:
      | EnumWithRecursiveDefault.Switcher<T>
      | EnumWithRecursiveDefault.SwitcherWithFallback<T>,
  ) => T;

  static readonly S = EnumWithRecursiveDefault_S;
}

export declare namespace EnumWithRecursiveDefault {
  export type ConstantKind = never;

  export type ValueKind = "f";

  export type Kind = ConstantKind | ValueKind;

  export type Copyable =
    | EnumWithRecursiveDefault
    | { kind: "f"; value: EnumWithRecursiveDefault.S.Copyable };

  export type CopyableFor<C extends ValueKind> = C extends "f"
    ? EnumWithRecursiveDefault.S.Copyable
    : never;

  export type Value = EnumWithRecursiveDefault.S | undefined;

  export type ValueFor<C extends ValueKind> = C extends "f"
    ? EnumWithRecursiveDefault.S
    : never;

  export interface Switcher<T> {
    "f": (v: EnumWithRecursiveDefault.S) => T;
  }

  export interface SwitcherWithFallback<T> extends Partial<Switcher<T>> {
    fallbackTo: () => T;
  }

  export type S = EnumWithRecursiveDefault_S;
}

// -----------------------------------------------------------------------------
// Initialize the serializers
// -----------------------------------------------------------------------------

const _MODULE_PATH = "enums.soia";

$._initEnumSerializer(
  Weekday.SERIALIZER,
  "Weekday",
  "Weekday",
  _MODULE_PATH,
  undefined,
  [
    ["MONDAY", 0, Weekday.MONDAY],
    ["TUESDAY", 1, Weekday.TUESDAY],
    ["WEDNESDAY", 2, Weekday.WEDNESDAY],
    ["THURSDAY", 3, Weekday.THURSDAY],
    ["FRIDAY", 4, Weekday.FRIDAY],
    ["SATURDAY", 5, Weekday.SATURDAY],
    ["SUNDAY", 6, Weekday.SUNDAY],
  ],
  [],
);

$._initStructSerializer(
  JsonValue_Pair.SERIALIZER,
  "Pair",
  "JsonValue.Pair",
  _MODULE_PATH,
  JsonValue.SERIALIZER.typeDescriptor,
  [
    ["name", "name", 0, $.primitiveSerializer("string")],
    ["value", "value", 1, JsonValue.SERIALIZER],
  ],
  [],
);

$._initEnumSerializer(
  JsonValue.SERIALIZER,
  "JsonValue",
  "JsonValue",
  _MODULE_PATH,
  undefined,
  [
    ["NULL", 0, JsonValue.NULL],
    ["boolean", 1, $.primitiveSerializer("bool")],
    ["number", 2, $.primitiveSerializer("float64")],
    ["string", 3, $.primitiveSerializer("string")],
    ["array", 4, $.arraySerializer(JsonValue.SERIALIZER)],
    ["object", 5, $.arraySerializer(JsonValue_Pair.SERIALIZER)],
  ],
  [],
);

$._initStructSerializer(
  EnumWithRecursiveDefault_S.SERIALIZER,
  "S",
  "EnumWithRecursiveDefault.S",
  _MODULE_PATH,
  EnumWithRecursiveDefault.SERIALIZER.typeDescriptor,
  [
    ["f", "f", 0, EnumWithRecursiveDefault.SERIALIZER],
  ],
  [],
);

$._initEnumSerializer(
  EnumWithRecursiveDefault.SERIALIZER,
  "EnumWithRecursiveDefault",
  "EnumWithRecursiveDefault",
  _MODULE_PATH,
  undefined,
  [
    ["f", 0, EnumWithRecursiveDefault_S.SERIALIZER],
  ],
  [],
);
