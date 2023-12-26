// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

// -----------------------------------------------------------------------------
// struct FullName
// -----------------------------------------------------------------------------

// Exported as 'FullName.Builder'
class FullName_Mutable extends $._MutableBase {
  constructor(
    copyable: FullName.Copyable = FullName.DEFAULT,
  ) {
    super();
    initFullName(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  firstName!: string;
  lastName!: string;

  toFrozen(): FullName {
    return FullName.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: FullName.Copyable | undefined;
}

export class FullName extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<FullName.Copyable, Accept>,
  ): FullName {
    if (copyable instanceof FullName) {
      return copyable;
    }
    return new FullName(copyable);
  }

  private constructor(copyable: FullName.Copyable) {
    super();
    initFullName(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly firstName!: string;
  readonly lastName!: string;

  static readonly DEFAULT = new FullName({});

  declare toFrozen: () => this;
  declare toMutable: () => FullName.Mutable;

  static readonly Mutable = FullName_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: FullName.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initFullName(
  target: Record<string, unknown>,
  copyable: FullName.Copyable,
): void {
  target.firstName = copyable.firstName || "";
  target.lastName = copyable.lastName || "";
}

export declare namespace FullName {
  export interface Copyable {
    readonly firstName?: string;
    readonly lastName?: string;
  }

  export type Mutable = FullName_Mutable;
  export type OrMutable = FullName | Mutable;
}

// -----------------------------------------------------------------------------
// Initialize the serializers
// -----------------------------------------------------------------------------

const _MODULE_PATH = "full_name.soia";

$._initStructSerializer(
  FullName.SERIALIZER,
  "FullName",
  "FullName",
  _MODULE_PATH,
  undefined,
  [
    ["first_name", "firstName", 0, $.primitiveSerializer("string")],
    ["last_name", "lastName", 1, $.primitiveSerializer("string")],
  ],
  [],
);
