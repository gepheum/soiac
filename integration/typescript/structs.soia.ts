// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

import { JsonValue as JsonValue, Weekday as Weekday } from "./enums.soia.ts";
import * as x_car from "./vehicles/car.soia.ts";

// -----------------------------------------------------------------------------
// struct Point
// -----------------------------------------------------------------------------

// Exported as 'Point.Builder'
class Point_Mutable extends $._MutableBase {
  constructor(
    copyable: Point.Copyable = Point.DEFAULT,
  ) {
    super();
    initPoint(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  x!: number;
  y!: number;

  toFrozen(): Point {
    return Point.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Point.Copyable | undefined;
}

export class Point extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Point.Copyable, Accept>,
  ): Point {
    if (copyable instanceof Point) {
      return copyable;
    }
    return new Point(copyable);
  }

  private constructor(copyable: Point.Copyable) {
    super();
    initPoint(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly x!: number;
  readonly y!: number;

  static readonly DEFAULT = new Point({});

  declare toFrozen: () => this;
  declare toMutable: () => Point.Mutable;

  static readonly Mutable = Point_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Point.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initPoint(
  target: Record<string, unknown>,
  copyable: Point.Copyable,
): void {
  target.x = copyable.x || 0;
  target.y = copyable.y || 0;
}

export declare namespace Point {
  export interface Copyable {
    readonly x?: number;
    readonly y?: number;
  }

  export type Mutable = Point_Mutable;
  export type OrMutable = Point | Mutable;
}

// -----------------------------------------------------------------------------
// struct Color
// -----------------------------------------------------------------------------

// Exported as 'Color.Builder'
class Color_Mutable extends $._MutableBase {
  constructor(
    copyable: Color.Copyable = Color.DEFAULT,
  ) {
    super();
    initColor(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  r!: number;
  g!: number;
  b!: number;

  toFrozen(): Color {
    return Color.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Color.Copyable | undefined;
}

export class Color extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Color.Copyable, Accept>,
  ): Color {
    if (copyable instanceof Color) {
      return copyable;
    }
    return new Color(copyable);
  }

  private constructor(copyable: Color.Copyable) {
    super();
    initColor(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly r!: number;
  readonly g!: number;
  readonly b!: number;

  static readonly DEFAULT = new Color({});

  declare toFrozen: () => this;
  declare toMutable: () => Color.Mutable;

  static readonly Mutable = Color_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Color.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initColor(
  target: Record<string, unknown>,
  copyable: Color.Copyable,
): void {
  target.r = copyable.r || 0;
  target.g = copyable.g || 0;
  target.b = copyable.b || 0;
}

export declare namespace Color {
  export interface Copyable {
    readonly r?: number;
    readonly g?: number;
    readonly b?: number;
  }

  export type Mutable = Color_Mutable;
  export type OrMutable = Color | Mutable;
}

// -----------------------------------------------------------------------------
// struct Triangle
// -----------------------------------------------------------------------------

// Exported as 'Triangle.Builder'
class Triangle_Mutable extends $._MutableBase {
  constructor(
    copyable: Triangle.Copyable = Triangle.DEFAULT,
  ) {
    super();
    initTriangle(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  color!: Color.OrMutable;
  points!: ReadonlyArray<Point.OrMutable>;

  get mutableColor(): Color.Mutable {
    const v = this.color;
    return v instanceof Color.Mutable ? v : (this.color = v.toMutable());
  }

  get mutablePoints(): Array<Point.OrMutable> {
    return this.points = $._toMutableArray(this.points);
  }

  toFrozen(): Triangle {
    return Triangle.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Triangle.Copyable | undefined;
}

export class Triangle extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Triangle.Copyable, Accept>,
  ): Triangle {
    if (copyable instanceof Triangle) {
      return copyable;
    }
    return new Triangle(copyable);
  }

  private constructor(copyable: Triangle.Copyable) {
    super();
    initTriangle(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly color!: Color;
  readonly points!: ReadonlyArray<Point>;

  static readonly DEFAULT = new Triangle({});

  declare toFrozen: () => this;
  declare toMutable: () => Triangle.Mutable;

  static readonly Mutable = Triangle_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Triangle.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initTriangle(
  target: Record<string, unknown>,
  copyable: Triangle.Copyable,
): void {
  target.color = Color.create(copyable.color || Color.DEFAULT);
  target.points = $._toFrozenArray(
    copyable.points || [],
    (e) => Point.create(e),
  );
}

export declare namespace Triangle {
  export interface Copyable {
    readonly color?: Color.Copyable;
    readonly points?: ReadonlyArray<Point.Copyable>;
  }

  export type Mutable = Triangle_Mutable;
  export type OrMutable = Triangle | Mutable;
}

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
  suffix!: string;

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
  readonly suffix!: string;

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
  target.suffix = copyable.suffix || "";
}

export declare namespace FullName {
  export interface Copyable {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly suffix?: string;
  }

  export type Mutable = FullName_Mutable;
  export type OrMutable = FullName | Mutable;
}

// -----------------------------------------------------------------------------
// struct Item.User
// -----------------------------------------------------------------------------

// Exported as 'Item.User.Builder'
class Item_User_Mutable extends $._MutableBase {
  constructor(
    copyable: Item.User.Copyable = Item_User.DEFAULT,
  ) {
    super();
    initItem_User(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  id!: string;

  toFrozen(): Item.User {
    return Item_User.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Item.User.Copyable | undefined;
}

// Exported as 'Item.User'
class Item_User extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Item.User.Copyable, Accept>,
  ): Item.User {
    if (copyable instanceof Item_User) {
      return copyable;
    }
    return new Item_User(copyable);
  }

  private constructor(copyable: Item.User.Copyable) {
    super();
    initItem_User(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly id!: string;

  static readonly DEFAULT = new Item_User({});

  declare toFrozen: () => this;
  declare toMutable: () => Item.User.Mutable;

  static readonly Mutable = Item_User_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Item.User.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initItem_User(
  target: Record<string, unknown>,
  copyable: Item.User.Copyable,
): void {
  target.id = copyable.id || "";
}

export declare namespace Item.User {
  export interface Copyable {
    readonly id?: string;
  }

  export type Mutable = Item_User_Mutable;
  export type OrMutable = User | Mutable;
}

// -----------------------------------------------------------------------------
// struct Item
// -----------------------------------------------------------------------------

// Exported as 'Item.Builder'
class Item_Mutable extends $._MutableBase {
  constructor(
    copyable: Item.Copyable = Item.DEFAULT,
  ) {
    super();
    initItem(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  bool!: boolean;
  string!: string;
  int32!: number;
  int64!: bigint;
  user!: Item.User.OrMutable;
  weekday!: Weekday;

  get mutableUser(): Item.User.Mutable {
    const v = this.user;
    return v instanceof Item_User.Mutable ? v : (this.user = v.toMutable());
  }

  toFrozen(): Item {
    return Item.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Item.Copyable | undefined;
}

export class Item extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Item.Copyable, Accept>,
  ): Item {
    if (copyable instanceof Item) {
      return copyable;
    }
    return new Item(copyable);
  }

  private constructor(copyable: Item.Copyable) {
    super();
    initItem(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly bool!: boolean;
  readonly string!: string;
  readonly int32!: number;
  readonly int64!: bigint;
  readonly user!: Item.User;
  readonly weekday!: Weekday;

  static readonly DEFAULT = new Item({});

  declare toFrozen: () => this;
  declare toMutable: () => Item.Mutable;

  static readonly Mutable = Item_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Item.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly User = Item_User;
}

function initItem(
  target: Record<string, unknown>,
  copyable: Item.Copyable,
): void {
  target.bool = copyable.bool || false;
  target.string = copyable.string || "";
  target.int32 = copyable.int32 || 0;
  target.int64 = copyable.int64 || BigInt(0);
  target.user = Item_User.create(copyable.user || Item_User.DEFAULT);
  target.weekday = Weekday.fromCopyable(copyable.weekday || Weekday.DEFAULT);
}

export declare namespace Item {
  export interface Copyable {
    readonly bool?: boolean;
    readonly string?: string;
    readonly int32?: number;
    readonly int64?: bigint;
    readonly user?: Item.User.Copyable;
    readonly weekday?: Weekday.Copyable;
  }

  export type Mutable = Item_Mutable;
  export type OrMutable = Item | Mutable;

  export type User = Item_User;
}

// -----------------------------------------------------------------------------
// struct Items
// -----------------------------------------------------------------------------

// Exported as 'Items.Builder'
class Items_Mutable extends $._MutableBase {
  constructor(
    copyable: Items.Copyable = Items.DEFAULT,
  ) {
    super();
    initItems(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  arrayWithBoolKey!: ReadonlyArray<Item.OrMutable>;
  arrayWithStringKey!: ReadonlyArray<Item.OrMutable>;
  arrayWithInt32Key!: ReadonlyArray<Item.OrMutable>;
  arrayWithInt64Key!: ReadonlyArray<Item.OrMutable>;
  arrayWithWrapperKey!: ReadonlyArray<Item.OrMutable>;
  arrayWithEnumKey!: ReadonlyArray<Item.OrMutable>;

  get mutableArrayWithBoolKey(): Array<Item.OrMutable> {
    return this.arrayWithBoolKey = $._toMutableArray(this.arrayWithBoolKey);
  }

  get mutableArrayWithStringKey(): Array<Item.OrMutable> {
    return this.arrayWithStringKey = $._toMutableArray(this.arrayWithStringKey);
  }

  get mutableArrayWithInt32Key(): Array<Item.OrMutable> {
    return this.arrayWithInt32Key = $._toMutableArray(this.arrayWithInt32Key);
  }

  get mutableArrayWithInt64Key(): Array<Item.OrMutable> {
    return this.arrayWithInt64Key = $._toMutableArray(this.arrayWithInt64Key);
  }

  get mutableArrayWithWrapperKey(): Array<Item.OrMutable> {
    return this.arrayWithWrapperKey = $._toMutableArray(this.arrayWithWrapperKey);
  }

  get mutableArrayWithEnumKey(): Array<Item.OrMutable> {
    return this.arrayWithEnumKey = $._toMutableArray(this.arrayWithEnumKey);
  }

  toFrozen(): Items {
    return Items.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Items.Copyable | undefined;
}

export class Items extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Items.Copyable, Accept>,
  ): Items {
    if (copyable instanceof Items) {
      return copyable;
    }
    return new Items(copyable);
  }

  private constructor(copyable: Items.Copyable) {
    super();
    initItems(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly arrayWithBoolKey!: ReadonlyArray<Item>;
  readonly arrayWithStringKey!: ReadonlyArray<Item>;
  readonly arrayWithInt32Key!: ReadonlyArray<Item>;
  readonly arrayWithInt64Key!: ReadonlyArray<Item>;
  readonly arrayWithWrapperKey!: ReadonlyArray<Item>;
  readonly arrayWithEnumKey!: ReadonlyArray<Item>;
  private __maps: {
    arrayWithBoolKey?: Map<boolean, Item>;
    arrayWithStringKey?: Map<string, Item>;
    arrayWithInt32Key?: Map<number, Item>;
    arrayWithInt64Key?: Map<string, Item>;
    arrayWithWrapperKey?: Map<string, Item>;
    arrayWithEnumKey?: Map<Weekday.Kind, Item>;
  } = {};

  get arrayWithBoolKeyMap(): ReadonlyMap<boolean, Item> {
    return this.__maps.arrayWithBoolKey || (
      this.__maps.arrayWithBoolKey = new Map(
        this.arrayWithBoolKey.map((v) => [v.bool, v])
      )
    );
  }

  get arrayWithStringKeyMap(): ReadonlyMap<string, Item> {
    return this.__maps.arrayWithStringKey || (
      this.__maps.arrayWithStringKey = new Map(
        this.arrayWithStringKey.map((v) => [v.string, v])
      )
    );
  }

  get arrayWithInt32KeyMap(): ReadonlyMap<number, Item> {
    return this.__maps.arrayWithInt32Key || (
      this.__maps.arrayWithInt32Key = new Map(
        this.arrayWithInt32Key.map((v) => [v.int32, v])
      )
    );
  }

  get arrayWithInt64KeyMap(): ReadonlyMap<string, Item> {
    return this.__maps.arrayWithInt64Key || (
      this.__maps.arrayWithInt64Key = new Map(
        this.arrayWithInt64Key.map((v) => [v.int64.toString(), v])
      )
    );
  }

  get arrayWithWrapperKeyMap(): ReadonlyMap<string, Item> {
    return this.__maps.arrayWithWrapperKey || (
      this.__maps.arrayWithWrapperKey = new Map(
        this.arrayWithWrapperKey.map((v) => [v.user.id, v])
      )
    );
  }

  get arrayWithEnumKeyMap(): ReadonlyMap<Weekday.Kind, Item> {
    return this.__maps.arrayWithEnumKey || (
      this.__maps.arrayWithEnumKey = new Map(
        this.arrayWithEnumKey.map((v) => [v.weekday.kind, v])
      )
    );
  }

  static readonly DEFAULT = new Items({});

  declare toFrozen: () => this;
  declare toMutable: () => Items.Mutable;

  static readonly Mutable = Items_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Items.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initItems(
  target: Record<string, unknown>,
  copyable: Items.Copyable,
): void {
  target.arrayWithBoolKey = $._toFrozenArray(
    copyable.arrayWithBoolKey || [],
    (e) => Item.create(e),
  );
  target.arrayWithStringKey = $._toFrozenArray(
    copyable.arrayWithStringKey || [],
    (e) => Item.create(e),
  );
  target.arrayWithInt32Key = $._toFrozenArray(
    copyable.arrayWithInt32Key || [],
    (e) => Item.create(e),
  );
  target.arrayWithInt64Key = $._toFrozenArray(
    copyable.arrayWithInt64Key || [],
    (e) => Item.create(e),
  );
  target.arrayWithWrapperKey = $._toFrozenArray(
    copyable.arrayWithWrapperKey || [],
    (e) => Item.create(e),
  );
  target.arrayWithEnumKey = $._toFrozenArray(
    copyable.arrayWithEnumKey || [],
    (e) => Item.create(e),
  );
}

export declare namespace Items {
  export interface Copyable {
    readonly arrayWithBoolKey?: ReadonlyArray<Item.Copyable>;
    readonly arrayWithStringKey?: ReadonlyArray<Item.Copyable>;
    readonly arrayWithInt32Key?: ReadonlyArray<Item.Copyable>;
    readonly arrayWithInt64Key?: ReadonlyArray<Item.Copyable>;
    readonly arrayWithWrapperKey?: ReadonlyArray<Item.Copyable>;
    readonly arrayWithEnumKey?: ReadonlyArray<Item.Copyable>;
  }

  export type Mutable = Items_Mutable;
  export type OrMutable = Items | Mutable;
}

// -----------------------------------------------------------------------------
// struct JsonValues
// -----------------------------------------------------------------------------

// Exported as 'JsonValues.Builder'
class JsonValues_Mutable extends $._MutableBase {
  constructor(
    copyable: JsonValues.Copyable = JsonValues.DEFAULT,
  ) {
    super();
    initJsonValues(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  jsonValues!: ReadonlyArray<JsonValue>;

  get mutableJsonValues(): Array<JsonValue> {
    return this.jsonValues = $._toMutableArray(this.jsonValues);
  }

  toFrozen(): JsonValues {
    return JsonValues.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: JsonValues.Copyable | undefined;
}

export class JsonValues extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<JsonValues.Copyable, Accept>,
  ): JsonValues {
    if (copyable instanceof JsonValues) {
      return copyable;
    }
    return new JsonValues(copyable);
  }

  private constructor(copyable: JsonValues.Copyable) {
    super();
    initJsonValues(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly jsonValues!: ReadonlyArray<JsonValue>;

  static readonly DEFAULT = new JsonValues({});

  declare toFrozen: () => this;
  declare toMutable: () => JsonValues.Mutable;

  static readonly Mutable = JsonValues_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: JsonValues.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initJsonValues(
  target: Record<string, unknown>,
  copyable: JsonValues.Copyable,
): void {
  target.jsonValues = $._toFrozenArray(
    copyable.jsonValues || [],
    (e) => JsonValue.fromCopyable(e),
  );
}

export declare namespace JsonValues {
  export interface Copyable {
    readonly jsonValues?: ReadonlyArray<JsonValue.Copyable>;
  }

  export type Mutable = JsonValues_Mutable;
  export type OrMutable = JsonValues | Mutable;
}

// -----------------------------------------------------------------------------
// struct CarOwner
// -----------------------------------------------------------------------------

// Exported as 'CarOwner.Builder'
class CarOwner_Mutable extends $._MutableBase {
  constructor(
    copyable: CarOwner.Copyable = CarOwner.DEFAULT,
  ) {
    super();
    initCarOwner(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  car!: x_car.Car.OrMutable;
  owner!: FullName.OrMutable;

  get mutableCar(): x_car.Car.Mutable {
    const v = this.car;
    return v instanceof x_car.Car.Mutable ? v : (this.car = v.toMutable());
  }

  get mutableOwner(): FullName.Mutable {
    const v = this.owner;
    return v instanceof FullName.Mutable ? v : (this.owner = v.toMutable());
  }

  toFrozen(): CarOwner {
    return CarOwner.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: CarOwner.Copyable | undefined;
}

export class CarOwner extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<CarOwner.Copyable, Accept>,
  ): CarOwner {
    if (copyable instanceof CarOwner) {
      return copyable;
    }
    return new CarOwner(copyable);
  }

  private constructor(copyable: CarOwner.Copyable) {
    super();
    initCarOwner(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly car!: x_car.Car;
  readonly owner!: FullName;

  static readonly DEFAULT = new CarOwner({});

  declare toFrozen: () => this;
  declare toMutable: () => CarOwner.Mutable;

  static readonly Mutable = CarOwner_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: CarOwner.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initCarOwner(
  target: Record<string, unknown>,
  copyable: CarOwner.Copyable,
): void {
  target.car = x_car.Car.create(copyable.car || x_car.Car.DEFAULT);
  target.owner = FullName.create(copyable.owner || FullName.DEFAULT);
}

export declare namespace CarOwner {
  export interface Copyable {
    readonly car?: x_car.Car.Copyable;
    readonly owner?: FullName.Copyable;
  }

  export type Mutable = CarOwner_Mutable;
  export type OrMutable = CarOwner | Mutable;
}

// -----------------------------------------------------------------------------
// struct Foo.Bar
// -----------------------------------------------------------------------------

// Exported as 'Foo.Bar.Builder'
class Foo_Bar_Mutable extends $._MutableBase {
  constructor(
    copyable: Foo.Bar.Copyable = Foo_Bar.DEFAULT,
  ) {
    super();
    initFoo_Bar(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  bar!: string | null;
  foos!: ReadonlyArray<Foo | null> | null;

  toFrozen(): Foo.Bar {
    return Foo_Bar.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Foo.Bar.Copyable | undefined;
}

// Exported as 'Foo.Bar'
class Foo_Bar extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Foo.Bar.Copyable, Accept>,
  ): Foo.Bar {
    if (copyable instanceof Foo_Bar) {
      return copyable;
    }
    return new Foo_Bar(copyable);
  }

  private constructor(copyable: Foo.Bar.Copyable) {
    super();
    initFoo_Bar(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly bar!: string | null;
  readonly foos!: ReadonlyArray<Foo | null> | null;

  static readonly DEFAULT = new Foo_Bar({});

  declare toFrozen: () => this;
  declare toMutable: () => Foo.Bar.Mutable;

  static readonly Mutable = Foo_Bar_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Foo.Bar.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initFoo_Bar(
  target: Record<string, unknown>,
  copyable: Foo.Bar.Copyable,
): void {
  target.bar = copyable.bar ?? null;
  target.foos = copyable.foos ? $._toFrozenArray(
    copyable.foos,
    (e) => e ? Foo.create(e) : null,
  ) : null;
}

export declare namespace Foo.Bar {
  export interface Copyable {
    readonly bar?: string | null;
    readonly foos?: ReadonlyArray<Foo.Copyable | null> | null;
  }

  export type Mutable = Foo_Bar_Mutable;
  export type OrMutable = Bar | Mutable;
}

// -----------------------------------------------------------------------------
// struct Foo.Zoo
// -----------------------------------------------------------------------------

// Exported as 'Foo.Zoo.Builder'
class Foo_Zoo_Mutable extends $._MutableBase {
  constructor(
    _: Foo.Zoo.Copyable = Foo_Zoo.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): Foo.Zoo {
    return Foo_Zoo.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Foo.Zoo.Copyable | undefined;
}

// Exported as 'Foo.Zoo'
class Foo_Zoo extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<Foo.Zoo.Copyable, Accept>,
  ): Foo.Zoo {
    return Foo_Zoo.DEFAULT;
  }

  private constructor(_: Foo.Zoo.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new Foo_Zoo({});

  declare toFrozen: () => this;
  declare toMutable: () => Foo.Zoo.Mutable;

  static readonly Mutable = Foo_Zoo_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Foo.Zoo.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace Foo.Zoo {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = Foo_Zoo_Mutable;
  export type OrMutable = Zoo | Mutable;
}

// -----------------------------------------------------------------------------
// struct Foo
// -----------------------------------------------------------------------------

// Exported as 'Foo.Builder'
class Foo_Mutable extends $._MutableBase {
  constructor(
    copyable: Foo.Copyable = Foo.DEFAULT,
  ) {
    super();
    initFoo(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  bars!: ReadonlyArray<Foo.Bar> | null;
  zoos!: ReadonlyArray<Foo.Zoo.OrMutable | null> | null;

  get mutableZoos(): Array<Foo.Zoo.OrMutable | null> {
    return this.zoos = $._toMutableArray(this.zoos || []);
  }

  toFrozen(): Foo {
    return Foo.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Foo.Copyable | undefined;
}

export class Foo extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Foo.Copyable, Accept>,
  ): Foo {
    if (copyable instanceof Foo) {
      return copyable;
    }
    return new Foo(copyable);
  }

  private constructor(copyable: Foo.Copyable) {
    super();
    initFoo(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly bars!: ReadonlyArray<Foo.Bar> | null;
  readonly zoos!: ReadonlyArray<Foo.Zoo | null> | null;

  static readonly DEFAULT = new Foo({});

  declare toFrozen: () => this;
  declare toMutable: () => Foo.Mutable;

  static readonly Mutable = Foo_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Foo.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Bar = Foo_Bar;
  static readonly Zoo = Foo_Zoo;
}

function initFoo(
  target: Record<string, unknown>,
  copyable: Foo.Copyable,
): void {
  target.bars = copyable.bars ? $._toFrozenArray(
    copyable.bars,
    (e) => Foo_Bar.create(e),
  ) : null;
  target.zoos = copyable.zoos ? $._toFrozenArray(
    copyable.zoos,
    (e) => e ? Foo_Zoo.create(e) : null,
  ) : null;
}

export declare namespace Foo {
  export interface Copyable {
    readonly bars?: ReadonlyArray<Foo.Bar.Copyable> | null;
    readonly zoos?: ReadonlyArray<Foo.Zoo.Copyable | null> | null;
  }

  export type Mutable = Foo_Mutable;
  export type OrMutable = Foo | Mutable;

  export type Bar = Foo_Bar;
  export type Zoo = Foo_Zoo;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Foo.Foo_.Foo__
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Foo.Foo_.Foo__.Builder'
class NameCollision_Foo_Foo__Foo___Mutable extends $._MutableBase {
  constructor(
    copyable: NameCollision.Foo.Foo_.Foo__.Copyable = NameCollision_Foo_Foo__Foo__.DEFAULT,
  ) {
    super();
    initNameCollision_Foo_Foo__Foo__(this as Record<string, unknown>, copyable);
    this.topLevelFoo = NameCollision_Foo.create(copyable.topLevelFoo || NameCollision_Foo.DEFAULT);
    Object.seal(this);
  }

  x!: number;
  topLevelFoo: NameCollision.Foo;

  toFrozen(): NameCollision.Foo.Foo_.Foo__ {
    return NameCollision_Foo_Foo__Foo__.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Foo.Foo_.Foo__.Copyable | undefined;
}

// Exported as 'NameCollision.Foo.Foo_.Foo__'
class NameCollision_Foo_Foo__Foo__ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<NameCollision.Foo.Foo_.Foo__.Copyable, Accept>,
  ): NameCollision.Foo.Foo_.Foo__ {
    if (copyable instanceof NameCollision_Foo_Foo__Foo__) {
      return copyable;
    }
    return new NameCollision_Foo_Foo__Foo__(copyable);
  }

  private constructor(copyable: NameCollision.Foo.Foo_.Foo__.Copyable) {
    super();
    initNameCollision_Foo_Foo__Foo__(this as Record<string, unknown>, copyable);
    if (copyable.topLevelFoo) {
      this._topLevelFoo = NameCollision_Foo.create(copyable.topLevelFoo);
    }
    Object.freeze(this);
  }

  readonly x!: number;
  private readonly _topLevelFoo: NameCollision.Foo | undefined;

  get topLevelFoo(): NameCollision.Foo {
    return this._topLevelFoo || NameCollision.Foo.DEFAULT;
  }

  static readonly DEFAULT = new NameCollision_Foo_Foo__Foo__({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Foo.Foo_.Foo__.Mutable;

  static readonly Mutable = NameCollision_Foo_Foo__Foo___Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Foo.Foo_.Foo__.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initNameCollision_Foo_Foo__Foo__(
  target: Record<string, unknown>,
  copyable: NameCollision.Foo.Foo_.Foo__.Copyable,
): void {
  target.x = copyable.x || 0;
}

export declare namespace NameCollision.Foo.Foo_.Foo__ {
  export interface Copyable {
    readonly x?: number;
    readonly topLevelFoo?: NameCollision.Foo.Copyable;
  }

  export type Mutable = NameCollision_Foo_Foo__Foo___Mutable;
  export type OrMutable = Foo__ | Mutable;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Foo.Foo_
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Foo.Foo_.Builder'
class NameCollision_Foo_Foo__Mutable extends $._MutableBase {
  constructor(
    copyable: NameCollision.Foo.Foo_.Copyable = NameCollision_Foo_Foo_.DEFAULT,
  ) {
    super();
    initNameCollision_Foo_Foo_(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  foo!: NameCollision.Foo.Foo_.Foo__;

  toFrozen(): NameCollision.Foo.Foo_ {
    return NameCollision_Foo_Foo_.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Foo.Foo_.Copyable | undefined;
}

// Exported as 'NameCollision.Foo.Foo_'
class NameCollision_Foo_Foo_ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<NameCollision.Foo.Foo_.Copyable, Accept>,
  ): NameCollision.Foo.Foo_ {
    if (copyable instanceof NameCollision_Foo_Foo_) {
      return copyable;
    }
    return new NameCollision_Foo_Foo_(copyable);
  }

  private constructor(copyable: NameCollision.Foo.Foo_.Copyable) {
    super();
    initNameCollision_Foo_Foo_(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly foo!: NameCollision.Foo.Foo_.Foo__;

  static readonly DEFAULT = new NameCollision_Foo_Foo_({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Foo.Foo_.Mutable;

  static readonly Mutable = NameCollision_Foo_Foo__Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Foo.Foo_.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Foo__ = NameCollision_Foo_Foo__Foo__;
}

function initNameCollision_Foo_Foo_(
  target: Record<string, unknown>,
  copyable: NameCollision.Foo.Foo_.Copyable,
): void {
  target.foo = NameCollision_Foo_Foo__Foo__.create(copyable.foo || NameCollision_Foo_Foo__Foo__.DEFAULT);
}

export declare namespace NameCollision.Foo.Foo_ {
  export interface Copyable {
    readonly foo?: NameCollision.Foo.Foo_.Foo__.Copyable;
  }

  export type Mutable = NameCollision_Foo_Foo__Mutable;
  export type OrMutable = Foo_ | Mutable;

  export type Foo__ = NameCollision_Foo_Foo__Foo__;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Foo
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Foo.Builder'
class NameCollision_Foo_Mutable extends $._MutableBase {
  constructor(
    copyable: NameCollision.Foo.Copyable = NameCollision_Foo.DEFAULT,
  ) {
    super();
    initNameCollision_Foo(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  foo!: NameCollision.Foo.Foo_;

  toFrozen(): NameCollision.Foo {
    return NameCollision_Foo.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Foo.Copyable | undefined;
}

// Exported as 'NameCollision.Foo'
class NameCollision_Foo extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<NameCollision.Foo.Copyable, Accept>,
  ): NameCollision.Foo {
    if (copyable instanceof NameCollision_Foo) {
      return copyable;
    }
    return new NameCollision_Foo(copyable);
  }

  private constructor(copyable: NameCollision.Foo.Copyable) {
    super();
    initNameCollision_Foo(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly foo!: NameCollision.Foo.Foo_;

  static readonly DEFAULT = new NameCollision_Foo({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Foo.Mutable;

  static readonly Mutable = NameCollision_Foo_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Foo.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Foo_ = NameCollision_Foo_Foo_;
}

function initNameCollision_Foo(
  target: Record<string, unknown>,
  copyable: NameCollision.Foo.Copyable,
): void {
  target.foo = NameCollision_Foo_Foo_.create(copyable.foo || NameCollision_Foo_Foo_.DEFAULT);
}

export declare namespace NameCollision.Foo {
  export interface Copyable {
    readonly foo?: NameCollision.Foo.Foo_.Copyable;
  }

  export type Mutable = NameCollision_Foo_Mutable;
  export type OrMutable = Foo | Mutable;

  export type Foo_ = NameCollision_Foo_Foo_;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Array.Array_
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Array.Array_.Builder'
class NameCollision_Array_Array__Mutable extends $._MutableBase {
  constructor(
    _: NameCollision.Array.Array_.Copyable = NameCollision_Array_Array_.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): NameCollision.Array.Array_ {
    return NameCollision_Array_Array_.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Array.Array_.Copyable | undefined;
}

// Exported as 'NameCollision.Array.Array_'
class NameCollision_Array_Array_ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<NameCollision.Array.Array_.Copyable, Accept>,
  ): NameCollision.Array.Array_ {
    return NameCollision_Array_Array_.DEFAULT;
  }

  private constructor(_: NameCollision.Array.Array_.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new NameCollision_Array_Array_({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Array.Array_.Mutable;

  static readonly Mutable = NameCollision_Array_Array__Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Array.Array_.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace NameCollision.Array.Array_ {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = NameCollision_Array_Array__Mutable;
  export type OrMutable = Array_ | Mutable;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Array
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Array.Builder'
class NameCollision_Array_Mutable extends $._MutableBase {
  constructor(
    copyable: NameCollision.Array.Copyable = NameCollision_Array.DEFAULT,
  ) {
    super();
    initNameCollision_Array(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  array!: NameCollision.Array.Array_.OrMutable;

  get mutableArray(): NameCollision.Array.Array_.Mutable {
    const v = this.array;
    return v instanceof NameCollision_Array_Array_.Mutable ? v : (this.array = v.toMutable());
  }

  toFrozen(): NameCollision.Array {
    return NameCollision_Array.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Array.Copyable | undefined;
}

// Exported as 'NameCollision.Array'
class NameCollision_Array extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<NameCollision.Array.Copyable, Accept>,
  ): NameCollision.Array {
    if (copyable instanceof NameCollision_Array) {
      return copyable;
    }
    return new NameCollision_Array(copyable);
  }

  private constructor(copyable: NameCollision.Array.Copyable) {
    super();
    initNameCollision_Array(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly array!: NameCollision.Array.Array_;

  static readonly DEFAULT = new NameCollision_Array({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Array.Mutable;

  static readonly Mutable = NameCollision_Array_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Array.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Array_ = NameCollision_Array_Array_;
}

function initNameCollision_Array(
  target: Record<string, unknown>,
  copyable: NameCollision.Array.Copyable,
): void {
  target.array = NameCollision_Array_Array_.create(copyable.array || NameCollision_Array_Array_.DEFAULT);
}

export declare namespace NameCollision.Array {
  export interface Copyable {
    readonly array?: NameCollision.Array.Array_.Copyable;
  }

  export type Mutable = NameCollision_Array_Mutable;
  export type OrMutable = Array | Mutable;

  export type Array_ = NameCollision_Array_Array_;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Value
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Value.Builder'
class NameCollision_Value_Mutable extends $._MutableBase {
  constructor(
    _: NameCollision.Value.Copyable = NameCollision_Value.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): NameCollision.Value {
    return NameCollision_Value.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Value.Copyable | undefined;
}

// Exported as 'NameCollision.Value'
class NameCollision_Value extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<NameCollision.Value.Copyable, Accept>,
  ): NameCollision.Value {
    return NameCollision_Value.DEFAULT;
  }

  private constructor(_: NameCollision.Value.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new NameCollision_Value({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Value.Mutable;

  static readonly Mutable = NameCollision_Value_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Value.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace NameCollision.Value {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = NameCollision_Value_Mutable;
  export type OrMutable = Value | Mutable;
}

// -----------------------------------------------------------------------------
// struct NameCollision.Enum.Mutable_
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Enum.Mutable_.Builder'
class NameCollision_Enum_Mutable__Mutable extends $._MutableBase {
  constructor(
    _: NameCollision.Enum.Mutable_.Copyable = NameCollision_Enum_Mutable_.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): NameCollision.Enum.Mutable_ {
    return NameCollision_Enum_Mutable_.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Enum.Mutable_.Copyable | undefined;
}

// Exported as 'NameCollision.Enum.Mutable_'
class NameCollision_Enum_Mutable_ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<NameCollision.Enum.Mutable_.Copyable, Accept>,
  ): NameCollision.Enum.Mutable_ {
    return NameCollision_Enum_Mutable_.DEFAULT;
  }

  private constructor(_: NameCollision.Enum.Mutable_.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new NameCollision_Enum_Mutable_({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Enum.Mutable_.Mutable;

  static readonly Mutable = NameCollision_Enum_Mutable__Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Enum.Mutable_.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace NameCollision.Enum.Mutable_ {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = NameCollision_Enum_Mutable__Mutable;
  export type OrMutable = Mutable_ | Mutable;
}

// -----------------------------------------------------------------------------
// enum NameCollision.Enum
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Enum'
class NameCollision_Enum extends $._EnumBase {
  static readonly DEFAULT_ = new NameCollision_Enum("DEFAULT", undefined);

  static create<Kind extends NameCollision.Enum.ValueKind>(
    kind: Kind,
    value: NameCollision.Enum.CopyableFor<Kind>,
  ): NameCollision.Enum {
    let v: NameCollision.Enum.Value;
    switch (kind) {
      case "mutable": {
        v = NameCollision_Enum_Mutable_.create(value as NameCollision.Enum.CopyableFor<"mutable">);
        break;
      }
      default: {
        throw new TypeError();
      }
    }
    return new NameCollision_Enum(kind, v);
  }

  static fromCopyable(
    copyable: NameCollision.Enum.Copyable,
  ): NameCollision.Enum {
    if (copyable instanceof NameCollision_Enum) {
      return copyable;
    }
    if (copyable instanceof Object) {
      return this.create(copyable.kind, copyable.value);
    }
    switch (copyable) {
      case "DEFAULT": {
        return NameCollision_Enum.DEFAULT_;
      }
    }
    throw new TypeError();
  }

  static readonly DEFAULT = this.DEFAULT_;

  static readonly SERIALIZER = $._newEnumSerializer(this.DEFAULT);

  private constructor(
    kind: NameCollision.Enum.Kind,
    value: NameCollision.Enum.Value,
  ) {
    super();
    this.kind = kind;
    this.value = value;
    Object.freeze(this);
  }

  readonly kind: NameCollision.Enum.Kind;
  readonly value: NameCollision.Enum.Value;

  declare as: <Kind extends NameCollision.Enum.ValueKind>(
    kind: Kind,
  ) => NameCollision.Enum.ValueFor<Kind> | undefined;

  declare switch: <T>(
    switcher:
      | NameCollision.Enum.Switcher<T>
      | NameCollision.Enum.SwitcherWithFallback<T>
  ) => T;

  static readonly Mutable_ = NameCollision_Enum_Mutable_;
}

export declare namespace NameCollision.Enum {
  export type ConstantKind = "DEFAULT";

  export type ValueKind = "mutable";

  export type Kind = ConstantKind | ValueKind;

  export type Copyable =
    | NameCollision.Enum
    | "DEFAULT"
    | { kind: "mutable"; value: NameCollision.Enum.Mutable_.Copyable };

  export type CopyableFor<C extends ValueKind> =
    C extends "mutable" ? NameCollision.Enum.Mutable_.Copyable :
    never;

  export type Value = NameCollision.Enum.Mutable_ | undefined;

  export type ValueFor<C extends ValueKind> =
    C extends "mutable" ? NameCollision.Enum.Mutable_ :
    never;

  export interface Switcher<T> {
    "DEFAULT": () => T;
    "mutable": (v: NameCollision.Enum.Mutable_) => T;
  }

  export interface SwitcherWithFallback<T> extends Partial<Switcher<T>> {
    fallbackTo: () => T;
  }

  export type Mutable_ = NameCollision_Enum_Mutable_;
}

// -----------------------------------------------------------------------------
// struct NameCollision
// -----------------------------------------------------------------------------

// Exported as 'NameCollision.Builder'
class NameCollision_Mutable extends $._MutableBase {
  constructor(
    copyable: NameCollision.Copyable = NameCollision.DEFAULT,
  ) {
    super();
    initNameCollision(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  foo!: NameCollision.Foo.OrMutable;
  array!: NameCollision.Array.OrMutable;

  get mutableFoo(): NameCollision.Foo.Mutable {
    const v = this.foo;
    return v instanceof NameCollision_Foo.Mutable ? v : (this.foo = v.toMutable());
  }

  get mutableArray(): NameCollision.Array.Mutable {
    const v = this.array;
    return v instanceof NameCollision_Array.Mutable ? v : (this.array = v.toMutable());
  }

  toFrozen(): NameCollision {
    return NameCollision.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: NameCollision.Copyable | undefined;
}

export class NameCollision extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<NameCollision.Copyable, Accept>,
  ): NameCollision {
    if (copyable instanceof NameCollision) {
      return copyable;
    }
    return new NameCollision(copyable);
  }

  private constructor(copyable: NameCollision.Copyable) {
    super();
    initNameCollision(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly foo!: NameCollision.Foo;
  readonly array!: NameCollision.Array;

  static readonly DEFAULT = new NameCollision({});

  declare toFrozen: () => this;
  declare toMutable: () => NameCollision.Mutable;

  static readonly Mutable = NameCollision_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: NameCollision.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Foo = NameCollision_Foo;
  static readonly Array = NameCollision_Array;
  static readonly Value = NameCollision_Value;
  static readonly Enum = NameCollision_Enum;
}

function initNameCollision(
  target: Record<string, unknown>,
  copyable: NameCollision.Copyable,
): void {
  target.foo = NameCollision_Foo.create(copyable.foo || NameCollision_Foo.DEFAULT);
  target.array = NameCollision_Array.create(copyable.array || NameCollision_Array.DEFAULT);
}

export declare namespace NameCollision {
  export interface Copyable {
    readonly foo?: NameCollision.Foo.Copyable;
    readonly array?: NameCollision.Array.Copyable;
  }

  export type Mutable = NameCollision_Mutable;
  export type OrMutable = NameCollision | Mutable;

  export type Foo = NameCollision_Foo;
  export type Array = NameCollision_Array;
  export type Value = NameCollision_Value;
  export type Enum = NameCollision_Enum;
}

// -----------------------------------------------------------------------------
// struct RecA
// -----------------------------------------------------------------------------

// Exported as 'RecA.Builder'
class RecA_Mutable extends $._MutableBase {
  constructor(
    copyable: RecA.Copyable = RecA.DEFAULT,
  ) {
    super();
    this.a = RecA.create(copyable.a || RecA.DEFAULT);
    this.b = RecB.create(copyable.b || RecB.DEFAULT);
    Object.seal(this);
  }

  a: RecA;
  b: RecB;

  toFrozen(): RecA {
    return RecA.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: RecA.Copyable | undefined;
}

export class RecA extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<RecA.Copyable, Accept>,
  ): RecA {
    if (copyable instanceof RecA) {
      return copyable;
    }
    return new RecA(copyable);
  }

  private constructor(copyable: RecA.Copyable) {
    super();
    if (copyable.a) {
      this._a = RecA.create(copyable.a);
    }
    if (copyable.b) {
      this._b = RecB.create(copyable.b);
    }
    Object.freeze(this);
  }

  private readonly _a: RecA | undefined;
  private readonly _b: RecB | undefined;

  get a(): RecA {
    return this._a || RecA.DEFAULT;
  }

  get b(): RecB {
    return this._b || RecB.DEFAULT;
  }

  static readonly DEFAULT = new RecA({});

  declare toFrozen: () => this;
  declare toMutable: () => RecA.Mutable;

  static readonly Mutable = RecA_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: RecA.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace RecA {
  export interface Copyable {
    readonly a?: RecA.Copyable;
    readonly b?: RecB.Copyable;
  }

  export type Mutable = RecA_Mutable;
  export type OrMutable = RecA | Mutable;
}

// -----------------------------------------------------------------------------
// struct RecB
// -----------------------------------------------------------------------------

// Exported as 'RecB.Builder'
class RecB_Mutable extends $._MutableBase {
  constructor(
    copyable: RecB.Copyable = RecB.DEFAULT,
  ) {
    super();
    initRecB(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  a!: RecA;
  aList!: ReadonlyArray<RecA | null> | null;

  toFrozen(): RecB {
    return RecB.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: RecB.Copyable | undefined;
}

export class RecB extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<RecB.Copyable, Accept>,
  ): RecB {
    if (copyable instanceof RecB) {
      return copyable;
    }
    return new RecB(copyable);
  }

  private constructor(copyable: RecB.Copyable) {
    super();
    initRecB(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly a!: RecA;
  readonly aList!: ReadonlyArray<RecA | null> | null;

  static readonly DEFAULT = new RecB({});

  declare toFrozen: () => this;
  declare toMutable: () => RecB.Mutable;

  static readonly Mutable = RecB_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: RecB.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initRecB(
  target: Record<string, unknown>,
  copyable: RecB.Copyable,
): void {
  target.a = RecA.create(copyable.a || RecA.DEFAULT);
  target.aList = copyable.aList ? $._toFrozenArray(
    copyable.aList,
    (e) => e ? RecA.create(e) : null,
  ) : null;
}

export declare namespace RecB {
  export interface Copyable {
    readonly a?: RecA.Copyable;
    readonly aList?: ReadonlyArray<RecA.Copyable | null> | null;
  }

  export type Mutable = RecB_Mutable;
  export type OrMutable = RecB | Mutable;
}

// -----------------------------------------------------------------------------
// struct Name.Name1
// -----------------------------------------------------------------------------

// Exported as 'Name.Name1.Builder'
class Name_Name1_Mutable extends $._MutableBase {
  constructor(
    _: Name.Name1.Copyable = Name_Name1.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): Name.Name1 {
    return Name_Name1.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Name.Name1.Copyable | undefined;
}

// Exported as 'Name.Name1'
class Name_Name1 extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<Name.Name1.Copyable, Accept>,
  ): Name.Name1 {
    return Name_Name1.DEFAULT;
  }

  private constructor(_: Name.Name1.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new Name_Name1({});

  declare toFrozen: () => this;
  declare toMutable: () => Name.Name1.Mutable;

  static readonly Mutable = Name_Name1_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Name.Name1.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

export declare namespace Name.Name1 {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = Name_Name1_Mutable;
  export type OrMutable = Name1 | Mutable;
}

// -----------------------------------------------------------------------------
// struct Name.Name2
// -----------------------------------------------------------------------------

// Exported as 'Name.Name2.Builder'
class Name_Name2_Mutable extends $._MutableBase {
  constructor(
    copyable: Name.Name2.Copyable = Name_Name2.DEFAULT,
  ) {
    super();
    initName_Name2(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  name1!: Name.Name1.OrMutable;

  get mutableName1(): Name.Name1.Mutable {
    const v = this.name1;
    return v instanceof Name_Name1.Mutable ? v : (this.name1 = v.toMutable());
  }

  toFrozen(): Name.Name2 {
    return Name_Name2.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Name.Name2.Copyable | undefined;
}

// Exported as 'Name.Name2'
class Name_Name2 extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Name.Name2.Copyable, Accept>,
  ): Name.Name2 {
    if (copyable instanceof Name_Name2) {
      return copyable;
    }
    return new Name_Name2(copyable);
  }

  private constructor(copyable: Name.Name2.Copyable) {
    super();
    initName_Name2(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly name1!: Name.Name1;

  static readonly DEFAULT = new Name_Name2({});

  declare toFrozen: () => this;
  declare toMutable: () => Name.Name2.Mutable;

  static readonly Mutable = Name_Name2_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Name.Name2.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initName_Name2(
  target: Record<string, unknown>,
  copyable: Name.Name2.Copyable,
): void {
  target.name1 = Name_Name1.create(copyable.name1 || Name_Name1.DEFAULT);
}

export declare namespace Name.Name2 {
  export interface Copyable {
    readonly name1?: Name.Name1.Copyable;
  }

  export type Mutable = Name_Name2_Mutable;
  export type OrMutable = Name2 | Mutable;
}

// -----------------------------------------------------------------------------
// struct Name.Name_.Name__
// -----------------------------------------------------------------------------

// Exported as 'Name.Name_.Name__.Builder'
class Name_Name__Name___Mutable extends $._MutableBase {
  constructor(
    copyable: Name.Name_.Name__.Copyable = Name_Name__Name__.DEFAULT,
  ) {
    super();
    initName_Name__Name__(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  name2!: Name.Name2.OrMutable;

  get mutableName2(): Name.Name2.Mutable {
    const v = this.name2;
    return v instanceof Name_Name2.Mutable ? v : (this.name2 = v.toMutable());
  }

  toFrozen(): Name.Name_.Name__ {
    return Name_Name__Name__.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Name.Name_.Name__.Copyable | undefined;
}

// Exported as 'Name.Name_.Name__'
class Name_Name__Name__ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<Name.Name_.Name__.Copyable, Accept>,
  ): Name.Name_.Name__ {
    if (copyable instanceof Name_Name__Name__) {
      return copyable;
    }
    return new Name_Name__Name__(copyable);
  }

  private constructor(copyable: Name.Name_.Name__.Copyable) {
    super();
    initName_Name__Name__(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly name2!: Name.Name2;

  static readonly DEFAULT = new Name_Name__Name__({});

  declare toFrozen: () => this;
  declare toMutable: () => Name.Name_.Name__.Mutable;

  static readonly Mutable = Name_Name__Name___Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Name.Name_.Name__.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initName_Name__Name__(
  target: Record<string, unknown>,
  copyable: Name.Name_.Name__.Copyable,
): void {
  target.name2 = Name_Name2.create(copyable.name2 || Name_Name2.DEFAULT);
}

export declare namespace Name.Name_.Name__ {
  export interface Copyable {
    readonly name2?: Name.Name2.Copyable;
  }

  export type Mutable = Name_Name__Name___Mutable;
  export type OrMutable = Name__ | Mutable;
}

// -----------------------------------------------------------------------------
// struct Name.Name_
// -----------------------------------------------------------------------------

// Exported as 'Name.Name_.Builder'
class Name_Name__Mutable extends $._MutableBase {
  constructor(
    _: Name.Name_.Copyable = Name_Name_.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): Name.Name_ {
    return Name_Name_.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Name.Name_.Copyable | undefined;
}

// Exported as 'Name.Name_'
class Name_Name_ extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<Name.Name_.Copyable, Accept>,
  ): Name.Name_ {
    return Name_Name_.DEFAULT;
  }

  private constructor(_: Name.Name_.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new Name_Name_({});

  declare toFrozen: () => this;
  declare toMutable: () => Name.Name_.Mutable;

  static readonly Mutable = Name_Name__Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Name.Name_.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Name__ = Name_Name__Name__;
}

export declare namespace Name.Name_ {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = Name_Name__Mutable;
  export type OrMutable = Name_ | Mutable;

  export type Name__ = Name_Name__Name__;
}

// -----------------------------------------------------------------------------
// struct Name
// -----------------------------------------------------------------------------

// Exported as 'Name.Builder'
class Name_Mutable extends $._MutableBase {
  constructor(
    _: Name.Copyable = Name.DEFAULT,
  ) {
    super();
    Object.seal(this);
  }

  toFrozen(): Name {
    return Name.DEFAULT;
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: Name.Copyable | undefined;
}

export class Name extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    _: $.WholeOrPartial<Name.Copyable, Accept>,
  ): Name {
    return Name.DEFAULT;
  }

  private constructor(_: Name.Copyable) {
    super();
    Object.freeze(this);
  }

  static readonly DEFAULT = new Name({});

  declare toFrozen: () => this;
  declare toMutable: () => Name.Mutable;

  static readonly Mutable = Name_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: Name.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);

  static readonly Name1 = Name_Name1;
  static readonly Name2 = Name_Name2;
  static readonly Name_ = Name_Name_;
}

export declare namespace Name {
  export type Copyable = Record<string | number | symbol, never> | OrMutable;

  export type Mutable = Name_Mutable;
  export type OrMutable = Name | Mutable;

  export type Name1 = Name_Name1;
  export type Name2 = Name_Name2;
  export type Name_ = Name_Name_;
}

// -----------------------------------------------------------------------------
// Initialize the serializers
// -----------------------------------------------------------------------------

const _MODULE_PATH = "structs.soia";

$._initStructSerializer(
  Point.SERIALIZER,
  "Point",
  "Point",
  _MODULE_PATH,
  undefined,
  [
    ["x", "x", 0, $.primitiveSerializer("int32")],
    ["y", "y", 1, $.primitiveSerializer("int32")],
  ],
  [],
);

$._initStructSerializer(
  Color.SERIALIZER,
  "Color",
  "Color",
  _MODULE_PATH,
  undefined,
  [
    ["r", "r", 0, $.primitiveSerializer("int32")],
    ["g", "g", 1, $.primitiveSerializer("int32")],
    ["b", "b", 2, $.primitiveSerializer("int32")],
  ],
  [],
);

$._initStructSerializer(
  Triangle.SERIALIZER,
  "Triangle",
  "Triangle",
  _MODULE_PATH,
  undefined,
  [
    ["color", "color", 0, Color.SERIALIZER],
    ["points", "points", 1, $.arraySerializer(Point.SERIALIZER)],
  ],
  [],
);

$._initStructSerializer(
  FullName.SERIALIZER,
  "FullName",
  "FullName",
  _MODULE_PATH,
  undefined,
  [
    ["first_name", "firstName", 0, $.primitiveSerializer("string")],
    ["last_name", "lastName", 2, $.primitiveSerializer("string")],
    ["suffix", "suffix", 3, $.primitiveSerializer("string")],
  ],
  [1],
);

$._initStructSerializer(
  Item_User.SERIALIZER,
  "User",
  "Item.User",
  _MODULE_PATH,
  Item.SERIALIZER.typeDescriptor,
  [
    ["id", "id", 0, $.primitiveSerializer("string")],
  ],
  [],
);

$._initStructSerializer(
  Item.SERIALIZER,
  "Item",
  "Item",
  _MODULE_PATH,
  undefined,
  [
    ["bool", "bool", 0, $.primitiveSerializer("bool")],
    ["string", "string", 1, $.primitiveSerializer("string")],
    ["int32", "int32", 2, $.primitiveSerializer("int32")],
    ["int64", "int64", 3, $.primitiveSerializer("int64")],
    ["user", "user", 4, Item_User.SERIALIZER],
    ["weekday", "weekday", 5, Weekday.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  Items.SERIALIZER,
  "Items",
  "Items",
  _MODULE_PATH,
  undefined,
  [
    ["array_with_bool_key", "arrayWithBoolKey", 0, $.arraySerializer(Item.SERIALIZER)],
    ["array_with_string_key", "arrayWithStringKey", 1, $.arraySerializer(Item.SERIALIZER)],
    ["array_with_int32_key", "arrayWithInt32Key", 2, $.arraySerializer(Item.SERIALIZER)],
    ["array_with_int64_key", "arrayWithInt64Key", 3, $.arraySerializer(Item.SERIALIZER)],
    ["array_with_wrapper_key", "arrayWithWrapperKey", 4, $.arraySerializer(Item.SERIALIZER)],
    ["array_with_enum_key", "arrayWithEnumKey", 5, $.arraySerializer(Item.SERIALIZER)],
  ],
  [],
);

$._initStructSerializer(
  JsonValues.SERIALIZER,
  "JsonValues",
  "JsonValues",
  _MODULE_PATH,
  undefined,
  [
    ["json_values", "jsonValues", 0, $.arraySerializer(JsonValue.SERIALIZER)],
  ],
  [],
);

$._initStructSerializer(
  CarOwner.SERIALIZER,
  "CarOwner",
  "CarOwner",
  _MODULE_PATH,
  undefined,
  [
    ["car", "car", 0, x_car.Car.SERIALIZER],
    ["owner", "owner", 1, FullName.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  Foo_Bar.SERIALIZER,
  "Bar",
  "Foo.Bar",
  _MODULE_PATH,
  Foo.SERIALIZER.typeDescriptor,
  [
    ["bar", "bar", 0, $.nullableSerializer($.primitiveSerializer("string"))],
    ["foos", "foos", 1, $.nullableSerializer($.arraySerializer($.nullableSerializer(Foo.SERIALIZER)))],
  ],
  [],
);

$._initStructSerializer(
  Foo_Zoo.SERIALIZER,
  "Zoo",
  "Foo.Zoo",
  _MODULE_PATH,
  Foo.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initStructSerializer(
  Foo.SERIALIZER,
  "Foo",
  "Foo",
  _MODULE_PATH,
  undefined,
  [
    ["bars", "bars", 0, $.nullableSerializer($.arraySerializer(Foo_Bar.SERIALIZER))],
    ["zoos", "zoos", 1, $.nullableSerializer($.arraySerializer($.nullableSerializer(Foo_Zoo.SERIALIZER)))],
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Foo_Foo__Foo__.SERIALIZER,
  "Foo",
  "NameCollision.Foo.Foo.Foo",
  _MODULE_PATH,
  NameCollision_Foo_Foo_.SERIALIZER.typeDescriptor,
  [
    ["x", "x", 0, $.primitiveSerializer("int32")],
    ["top_level_foo", "topLevelFoo", 1, NameCollision_Foo.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Foo_Foo_.SERIALIZER,
  "Foo",
  "NameCollision.Foo.Foo",
  _MODULE_PATH,
  NameCollision_Foo.SERIALIZER.typeDescriptor,
  [
    ["foo", "foo", 0, NameCollision_Foo_Foo__Foo__.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Foo.SERIALIZER,
  "Foo",
  "NameCollision.Foo",
  _MODULE_PATH,
  NameCollision.SERIALIZER.typeDescriptor,
  [
    ["foo", "foo", 0, NameCollision_Foo_Foo_.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Array_Array_.SERIALIZER,
  "Array",
  "NameCollision.Array.Array",
  _MODULE_PATH,
  NameCollision_Array.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Array.SERIALIZER,
  "Array",
  "NameCollision.Array",
  _MODULE_PATH,
  NameCollision.SERIALIZER.typeDescriptor,
  [
    ["array", "array", 0, NameCollision_Array_Array_.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Value.SERIALIZER,
  "Value",
  "NameCollision.Value",
  _MODULE_PATH,
  NameCollision.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initStructSerializer(
  NameCollision_Enum_Mutable_.SERIALIZER,
  "Mutable",
  "NameCollision.Enum.Mutable",
  _MODULE_PATH,
  NameCollision_Enum.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initEnumSerializer(
  NameCollision_Enum.SERIALIZER,
  "Enum",
  "NameCollision.Enum",
  _MODULE_PATH,
  NameCollision.SERIALIZER.typeDescriptor,
  [
    ["DEFAULT", 0, NameCollision_Enum.DEFAULT_],
    ["mutable", 1, NameCollision_Enum_Mutable_.SERIALIZER],],
    [],
);

$._initStructSerializer(
  NameCollision.SERIALIZER,
  "NameCollision",
  "NameCollision",
  _MODULE_PATH,
  undefined,
  [
    ["foo", "foo", 0, NameCollision_Foo.SERIALIZER],
    ["array", "array", 1, NameCollision_Array.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  RecA.SERIALIZER,
  "RecA",
  "RecA",
  _MODULE_PATH,
  undefined,
  [
    ["a", "a", 0, RecA.SERIALIZER],
    ["b", "b", 1, RecB.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  RecB.SERIALIZER,
  "RecB",
  "RecB",
  _MODULE_PATH,
  undefined,
  [
    ["a", "a", 0, RecA.SERIALIZER],
    ["a_list", "aList", 1, $.nullableSerializer($.arraySerializer($.nullableSerializer(RecA.SERIALIZER)))],
  ],
  [],
);

$._initStructSerializer(
  Name_Name1.SERIALIZER,
  "Name1",
  "Name.Name1",
  _MODULE_PATH,
  Name.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initStructSerializer(
  Name_Name2.SERIALIZER,
  "Name2",
  "Name.Name2",
  _MODULE_PATH,
  Name.SERIALIZER.typeDescriptor,
  [
    ["name1", "name1", 0, Name_Name1.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  Name_Name__Name__.SERIALIZER,
  "Name",
  "Name.Name.Name",
  _MODULE_PATH,
  Name_Name_.SERIALIZER.typeDescriptor,
  [
    ["name2", "name2", 0, Name_Name2.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  Name_Name_.SERIALIZER,
  "Name",
  "Name.Name",
  _MODULE_PATH,
  Name.SERIALIZER.typeDescriptor,
  [
  ],
  [],
);

$._initStructSerializer(
  Name.SERIALIZER,
  "Name",
  "Name",
  _MODULE_PATH,
  undefined,
  [
  ],
  [],
);

