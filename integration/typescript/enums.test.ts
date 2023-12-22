import { expect } from "buckwheat";
import { describe, it } from "mocha";
import { EnumWithRecursiveDefault, JsonValue, Weekday } from "./enums.soia.ts";
import { EnumField } from "soia";
import { SerializerTester } from "./serializer_tester.ts";
import { Car } from "./vehicles/car.soia.ts";

describe("simple enum", () => {
  const monday = Weekday.MONDAY;
  it("first field is default", () => {
    expect(Weekday.DEFAULT).toBe(monday);
  });
  describe("#fromCopyable", () => {
    it("constant name", () => {
      expect(Weekday.fromCopyable("MONDAY")).toBe(monday);
    });
    it("constant", () => {
      expect(Weekday.fromCopyable(monday)).toBe(monday);
    });
  });
  describe("#kind", () => {
    it("constant", () => {
      expect(monday.kind).toBe("MONDAY");
    });
  });
  describe("switch", () => {
    it("works", () => {
      const switchResult = monday.switch({
        "MONDAY": () => "Monday",
        "TUESDAY": () => "Tuesday",
        "WEDNESDAY": () => "Wednesday",
        "THURSDAY": () => "Thursday",
        "FRIDAY": () => "Friday",
        "SATURDAY": () => "Saturday",
        "SUNDAY": () => "Sunday",
      });
      expect(switchResult).toBe("Monday");
    });
  });
  describe("#typeDescriptor", () => {
    it("#kind", () => {
      expect(Weekday.SERIALIZER.typeDescriptor.kind).toBe("enum");
    });
  });
  describe("serializer", () => {
    const serializerTester = new SerializerTester(Weekday.SERIALIZER);
    serializerTester.reserializeAndAssert(monday, {
      denseJson: 0,
      readableJson: "MONDAY",
      binaryFormBase16: "00",
    });
    serializerTester.reserializeAndAssert(Weekday.TUESDAY, {
      denseJson: 1,
      readableJson: "TUESDAY",
      binaryFormBase16: "01",
    });
    it("deserializes alternative forms", () => {
      expect(Weekday.SERIALIZER.fromJsonCode('{"kind": "TUESDAY"}')).toBe(
        Weekday.TUESDAY,
      );
      expect(
        Weekday.SERIALIZER.fromJsonCode('{"kind": "TUESDAY", "value": {}}'),
      ).toBe(Weekday.TUESDAY);
      expect(Weekday.SERIALIZER.fromJsonCode("[1]")).toBe(Weekday.TUESDAY);
      expect(Weekday.SERIALIZER.fromJsonCode("[1,[]]")).toBe(Weekday.TUESDAY);
    });
  });
  describe("#toString", () => {
    expect(Weekday.SATURDAY.toString()).toBe('"SATURDAY"');
  });
  {
    const _: Weekday.Kind = "MONDAY";
  }
  {
    const _: Weekday.ConstantKind = "MONDAY";
  }
});

describe("recursive enum", () => {
  describe("#fromCopyable", () => {
    it("constant name", () => {
      expect(JsonValue.fromCopyable("NULL")).toBe(JsonValue.NULL);
    });
    it("constant", () => {
      expect(JsonValue.fromCopyable(JsonValue.NULL)).toBe(JsonValue.NULL);
    });
  });

  const complexValue = JsonValue.fromCopyable({
    kind: "array",
    value: [
      "NULL",
      {
        kind: "boolean",
        value: true,
      },
      JsonValue.NULL,
      {
        kind: "object",
        value: [
          {
            "name": "foo",
            "value": {
              kind: "string",
              value: "bar",
            },
          },
        ],
      },
    ],
  });

  const serializerTester = new SerializerTester(JsonValue.SERIALIZER);
  serializerTester.reserializeAndAssert(JsonValue.NULL, {
    denseJson: 0,
    readableJson: "NULL",
    binaryFormBase16: "00",
  });
  serializerTester.reserializeAndAssert(
    complexValue,
    {
      denseJson: [4, [0, [1, true], 0, [5, [["foo", [3, "bar"]]]]]],
      readableJson: {
        kind: "array",
        value: [
          "NULL",
          {
            kind: "boolean",
            value: true,
          },
          "NULL",
          {
            kind: "object",
            value: [
              {
                name: "foo",
                value: {
                  kind: "string",
                  value: "bar",
                },
              },
            ],
          },
        ],
      }, // Here, this 03 is for length, and it's 0d in other...
      binaryFormBase16: "fef90400fb0100f805f7f8f303666f6ffdf303626172",
      // fef90400fb0100f805f7f8f30d666f6fefbfbdefbfbd03626172fdf303626172
    },
  );

  it("#kind", () => {
    expect(complexValue.kind).toBe("array");
  });

  it("#value", () => {
    expect(Array.isArray(complexValue.value)).toBe(true);
  });

  it("switch", () => {
    const arrayLength = complexValue.switch({
      "NULL": () => 0,
      "array": (v: readonly JsonValue[]) => v.length,
      "boolean": () => 0,
      "number": () => 0,
      "object": () => 0,
      "string": () => 0,
      fallbackTo: () => -1,
    });
    expect(arrayLength).toBe(4);
  });

  it("#toString", () => {
    expect(complexValue.toString()).toBe([
      "{",
      '  "kind": "array",',
      '  "value": [',
      '    "NULL",',
      "    {",
      '      "kind": "boolean",',
      '      "value": true',
      "    },",
      '    "NULL",',
      "    {",
      '      "kind": "object",',
      '      "value": [',
      "        {",
      '          "name": "foo",',
      '          "value": {',
      '            "kind": "string",',
      '            "value": "bar"',
      "          }",
      "        }",
      "      ]",
      "    }",
      "  ]",
      "}",
    ].join("\n"));
  });

  {
    const _: JsonValue.ConstantKind = "NULL";
  }
  {
    const _: JsonValue.ValueKind = "array";
  }
  {
    const _: JsonValue.Kind = "NULL";
  }
  {
    const _: JsonValue.Kind = "array";
  }
});

describe("enum with recursive default", () => {
  const Enum = EnumWithRecursiveDefault;
  const serializerTester = new SerializerTester(Enum.SERIALIZER);
  serializerTester.reserializeAndAssert(Enum.DEFAULT, {
    denseJson: [0, []],
    binaryFormBase16: "faf6",
    readableJson: { kind: "f", value: {} },
  });
  serializerTester.deserializeZeroAndAssert(() => true);
});

describe("enum reflection", () => {
  it("get module path", () => {
    expect(Car.SERIALIZER.typeDescriptor.modulePath).toBe("vehicles/car.soia");
  });

  it("get record name", () => {
    expect(JsonValue.SERIALIZER.typeDescriptor.name).toBe("JsonValue");
    expect(JsonValue.SERIALIZER.typeDescriptor.qualifiedName).toBe("JsonValue");
    expect(JsonValue.Pair.SERIALIZER.typeDescriptor.name).toBe("Pair");
    expect(JsonValue.Pair.SERIALIZER.typeDescriptor.qualifiedName).toBe(
      "JsonValue.Pair",
    );
  });

  it("get parent type", () => {
    expect(
      JsonValue.Pair.SERIALIZER.typeDescriptor.parentType,
    ).toBe(
      JsonValue.SERIALIZER.typeDescriptor,
    );
    expect(JsonValue.SERIALIZER.typeDescriptor.parentType).toBe(undefined);
  });

  it("get field", () => {
    const typeDescriptor = JsonValue.SERIALIZER.typeDescriptor;
    expect(typeDescriptor.kind).toBe("enum");

    const nullField: EnumField<JsonValue> = typeDescriptor.getField("NULL");
    const arrayField: EnumField<JsonValue> = typeDescriptor.getField("array");

    expect(nullField).toBe(typeDescriptor.getField(0)!);
    expect(arrayField).toBe(typeDescriptor.getField(4)!);

    expect(nullField.name).toBe("NULL");
    expect(nullField.number).toBe(0);
    expect(arrayField.name).toBe("array");
    expect(arrayField.number).toBe(4);

    const arrayType = arrayField.type!;
    expect(arrayType.kind).toBe("array");
    if (arrayType.kind === "array") {
      expect(arrayType.itemType.kind).toBe("enum");
    }

    expect(typeDescriptor.getField("foo")).toBe(undefined);
    expect(typeDescriptor.getField(10)).toBe(undefined);

    // Let's make sure that the return type is nullable.
    {
      const absentField = typeDescriptor.getField("foo");
      const _: undefined extends typeof absentField ? true : never = true;
    }
    {
      const absentField = typeDescriptor.getField(10);
      const _: undefined extends typeof absentField ? true : never = true;
    }
  });
});
