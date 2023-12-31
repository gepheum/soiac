// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

import { User as User } from "../user.soia.ts";

// -----------------------------------------------------------------------------
// struct Car
// -----------------------------------------------------------------------------

// Exported as 'Car.Builder'
class Car_Mutable extends $._MutableBase {
  constructor(
    copyable: Car.Copyable = Car.DEFAULT,
  ) {
    super();
    initCar(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  model!: string;
  purchaseTime!: $.Timestamp;
  owner!: User.OrMutable;

  get mutableOwner(): User.Mutable {
    const v = this.owner;
    return v instanceof User.Mutable ? v : (this.owner = v.toMutable());
  }

  toFrozen(): Car {
    return Car.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Car.Copyable | undefined;
}

export class Car extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Car.Copyable, Accept>,
  ): Car {
    if (copyable instanceof Car) {
      return copyable;
    }
    return new Car(copyable);
  }

  private constructor(copyable: Car.Copyable) {
    super();
    initCar(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly model!: string;
  readonly purchaseTime!: $.Timestamp;
  readonly owner!: User;

  static readonly DEFAULT = new Car({});

  declare toFrozen: () => this;
  declare toMutable: () => Car.Mutable;

  static readonly Mutable = Car_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Car.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initCar(
  target: Record<string, unknown>,
  copyable: Car.Copyable,
): void {
  target.model = copyable.model || "";
  target.purchaseTime = copyable.purchaseTime || $.Timestamp.UNIX_EPOCH;
  target.owner = User.create(copyable.owner || User.DEFAULT);
}

export declare namespace Car {
  export interface Copyable {
    readonly model?: string;
    readonly purchaseTime?: $.Timestamp;
    readonly owner?: User.Copyable;
  }

  export type Mutable = Car_Mutable;
  export type OrMutable = Car | Mutable;
}

// -----------------------------------------------------------------------------
// Initialize the serializers
// -----------------------------------------------------------------------------

const _MODULE_PATH = "vehicles/car.soia";

$._initStructSerializer(
  Car.SERIALIZER,
  "Car",
  "Car",
  _MODULE_PATH,
  undefined,
  [
    ["model", "model", 0, $.primitiveSerializer("string")],
    ["purchase_time", "purchaseTime", 1, $.primitiveSerializer("timestamp")],
    ["owner", "owner", 2, User.SERIALIZER],
  ],
  [],
);

