import { expect } from "buckwheat";
import { describe, it } from "mocha";
import { FullName, Item, Items, Point, Triangle } from "./structs.soia.ts";
import { MutableForm, StructDescriptor, StructField } from "soia";
import { SerializerTester } from "./serializer_tester.ts";

describe("simple struct", () => {
  it("reserialize", () => {
    const serializer = Point.SERIALIZER;
    const serializerTester = new SerializerTester(serializer);
    serializerTester.reserializeAndAssert(
      Point.create({
        x: 10,
        y: 11,
      }),
      {
        denseJson: [10, 11],
        readableJson: {
          x: 10,
          y: 11,
        },
        binaryFormBase16: "f80a0b",
      },
    );
    serializerTester.reserializeAndAssert(
      Point.DEFAULT,
      {
        denseJson: [],
        readableJson: {},
        binaryFormBase16: "f6",
      },
    );
    serializerTester.reserializeAndAssert(
      Point.DEFAULT.toMutable(),
      {
        denseJson: [],
        readableJson: {},
        binaryFormBase16: "f6",
      },
    );
    serializerTester.deserializeZeroAndAssert((p) => p.x === 0 && p.y === 0);
  });

  it("create partial versus whole", () => {
    {
      const _: Point = Point.create({
        x: 10,
      });
    }
    {
      const _: Point = Point.create<"partial">({
        x: 10,
      });
    }
    {
      const _: Point = Point.create<"whole">({
        x: 10,
        y: 11,
      });
    }
  });

  it("#toString()", () => {
    expect(Point.DEFAULT.toString()).toBe("{}");
    expect(Point.create({ x: 10 }).toString()).toBe('{\n  "x": 10\n}');
    expect(
      Point.create({ x: 10, y: 20 }).toString(),
    ).toBe(
      '{\n  "x": 10,\n  "y": 20\n}',
    );
  });

  it("properties of default Point", () => {
    expect(Point.DEFAULT.x).toBe(0);
    expect(Point.DEFAULT.y).toBe(0);
  });

  it("make modified copy", () => {
    const mutablePoint = Point.create({
      x: 10,
      y: 11,
    }).toMutable();
    mutablePoint.y = 12;
    const point = mutablePoint.toFrozen();
    expect(point.x).toBe(10);
    expect(point.y).toBe(12);
  });

  it("#toFrozen() returns this if this is frozen", () => {
    const point = Point.create({
      x: 10,
      y: 11,
    });
    expect(point.toFrozen()).toBe(point);
  });

  it("#toMutable() returns this if this is mutable", () => {
    const point = new Point.Mutable({
      x: 10,
      y: 11,
    });
    expect(point.toMutable()).toBe(point);
  });

  it("mutableArray() getter", () => {
    const p0 = Point.create({ x: 10 });
    const p1 = Point.create({ x: 11 });
    const mutable = new Triangle.Mutable();
    {
      const mutablePoints = mutable.mutablePoints;
      mutablePoints.push(p0);
      mutablePoints.push(p1);
      expect(mutable.mutablePoints).toBe(mutablePoints);
      expect(mutable.points).toMatch([p0, p1]);
      expect(mutable.toFrozen().points).toMatch([p0, p1]);
    }
    // Now let's assign a new value to the `points` field.
    {
      const points = [p0, p1];
      mutable.points = points;
      const mutablePoints = mutable.mutablePoints;
      // Verify that a copy was made.
      points.push(p0);
      expect(mutablePoints).toMatch([p0, p1]);
      expect(mutable.mutablePoints).toBe(mutablePoints);
    }
  });
});

describe("struct reflection", () => {
  it("get module path", () => {
    expect(
      FullName.SERIALIZER.typeDescriptor.modulePath,
    ).toBe(
      "structs.soia",
    );
  });

  it("get record name", () => {
    expect(FullName.SERIALIZER.typeDescriptor.name).toBe("FullName");
    expect(FullName.SERIALIZER.typeDescriptor.qualifiedName).toBe("FullName");
    expect(Item.User.SERIALIZER.typeDescriptor.name).toBe("User");
    expect(Item.User.SERIALIZER.typeDescriptor.qualifiedName).toBe("Item.User");
  });

  it("get parent type", () => {
    expect(Item.User.SERIALIZER.typeDescriptor.parentType).toBe(
      Item.SERIALIZER.typeDescriptor,
    );
    expect(Item.SERIALIZER.typeDescriptor.parentType).toBe(undefined);
  });

  it("get field", () => {
    const typeDescriptor = FullName.SERIALIZER.typeDescriptor;
    expect(typeDescriptor.kind).toBe("struct");

    const firstName: StructField<FullName> = typeDescriptor.getField(
      "firstName",
    );
    const lastName: StructField<FullName> = typeDescriptor.getField(
      "lastName",
    )!;
    expect(firstName).toBe(typeDescriptor.getField(0)!);
    expect(lastName).toBe(typeDescriptor.getField(2)!);
    expect(lastName).toBe(typeDescriptor.getField("last_name")!);

    expect(firstName.name).toBe("first_name");
    expect(firstName.property).toBe("firstName");
    expect(firstName.number).toBe(0);
    expect(lastName.name).toBe("last_name");

    const lastNameType = lastName.type;
    expect(lastNameType.kind).toBe("primitive");
    if (lastNameType.kind === "primitive") {
      expect(lastNameType.primitive).toBe("string");
    }

    expect(typeDescriptor.getField("foo")).toBe(undefined);
    expect(typeDescriptor.getField(1)).toBe(undefined);

    // Let's make sure that the return type is nullable.
    // Let's make sure that the return type is nullable.
    {
      const absentField = typeDescriptor.getField("foo");
      const _: undefined extends typeof absentField ? true : never = true;
    }
    {
      const absentField = typeDescriptor.getField(1);
      const _: undefined extends typeof absentField ? true : never = true;
    }
  });

  it("get and set field", () => {
    const typeDescriptor = FullName.SERIALIZER.typeDescriptor;
    const firstName: StructField<FullName> = typeDescriptor.getField(
      "firstName",
    );

    const fullName = FullName.create({
      firstName: "Jane",
      lastName: "Doe",
    });
    const mutableFullName = fullName.toMutable();
    expect(firstName.get(fullName)).toBe("Jane");
    expect(firstName.get(mutableFullName)).toBe("Jane");
    firstName.set(mutableFullName, "John");
    expect(firstName.get(mutableFullName)).toBe("John");
  });

  it("create new mutable with reflection", () => {
    function copyValue<T, Value>(
      field: StructField<T, Value>,
      source: T | MutableForm<T>,
      target: MutableForm<T>,
    ): void {
      const value: Value = field.get(source);
      field.set(target, value);
    }

    function copyAllFieldsButOne<T>(
      descriptor: StructDescriptor<T>,
      copyable: T,
      skipName: string,
    ): T {
      const mutable: MutableForm<T> = descriptor.newMutable();
      for (const field of descriptor.fields) {
        if (field.name !== skipName) {
          copyValue(field, copyable, mutable);
        }
      }
      return mutable.toFrozen();
    }

    const fullName = FullName.create({ firstName: "Jane", lastName: "Doe" });
    const copy = copyAllFieldsButOne(
      FullName.SERIALIZER.typeDescriptor,
      fullName,
      "first_name",
    );
    expect(FullName.SERIALIZER.toJson(copy)).toMatch(["", 0, "Doe"]);
  });
});

describe("struct with indexed arrays", () => {
  it("works", () => {
    const item0 = Item.create({
      bool: false,
      int32: 10,
      int64: BigInt(10),
      string: "s10",
      user: { id: "id10" },
      weekday: "MONDAY",
    });
    const item1 = Item.create({
      bool: true,
      int32: 11,
      int64: BigInt(11),
      string: "s11",
      user: { id: "id11" },
      weekday: "TUESDAY",
    });
    const item2 = Item.create({
      bool: true,
      int32: 12,
      int64: BigInt(12),
      string: "s12",
      user: { id: "id12" },
      weekday: "WEDNESDAY",
    });
    const array = [item0, item1, item2];
    const items = Items.create({
      arrayWithBoolKey: array,
      arrayWithInt32Key: array,
      arrayWithInt64Key: array,
      arrayWithStringKey: array,
      arrayWithWrapperKey: array,
      arrayWithEnumKey: array,
    });

    expect(items.arrayWithBoolKeyMap.get(false)).toBe(item0);
    expect(items.arrayWithBoolKeyMap.get(true)).toBe(item2);
    expect(items.arrayWithEnumKeyMap.get("TUESDAY")).toBe(item1);
    expect(items.arrayWithInt32KeyMap.get(10)).toBe(item0);
    expect(items.arrayWithInt64KeyMap.get("12")).toBe(item2);
    expect(items.arrayWithStringKeyMap.get("s12")).toBe(item2);
    expect(items.arrayWithWrapperKeyMap.get("id12")).toBe(item2);

    const mutableItems = items.toMutable();
    expect(mutableItems.arrayWithEnumKey).toMatch(array);
    Items.SERIALIZER.toJson(items);
    Items.SERIALIZER.toJson(items.toMutable());
    expect(mutableItems.toString()).toBe(items.toString());
    expect(mutableItems.toString()).toMatch(
      Items.SERIALIZER.toJsonCode(items, "readable"),
    );
  });
});
