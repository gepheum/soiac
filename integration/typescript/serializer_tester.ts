import { expect } from "buckwheat";
import { describe, it } from "mocha";
import type { Json, JsonFlavor, MutableForm, Serializer } from "soia";

export class SerializerTester<T> {
  constructor(readonly serializer: Serializer<T>) {}

  reserializeAndAssert(
    input: T | MutableForm<T>,
    expected: {
      denseJson: Json;
      /** Defaults to `denseJson`. */
      readableJson?: Json;
      binaryFormBase16: string;
    },
    description?: string,
  ) {
    describe(description ?? `reserialize ${input}`, () => {
      const { serializer } = this;

      // Test JSON serialization.
      const jsonFlavors: JsonFlavor[] = ["dense", "readable"];
      for (const flavor of jsonFlavors) {
        const expectedJson = flavor === "dense"
          ? expected.denseJson
          : (expected.readableJson ?? expected.denseJson);

        describe(`${flavor} JSON`, () => {
          const toJsonResult = serializer.toJson(input, flavor);
          it("#toJson()", () => {
            expect(toJsonResult).toMatch(expectedJson);
          });
          it("#toJsonCode()", () => {
            const actualJsonCode = serializer.toJsonCode(input, flavor);
            const expectedJsonCode = JSON.stringify(
              expectedJson,
              undefined,
              flavor === "dense" ? "" : "  ",
            );
            expect(actualJsonCode).toBe(expectedJsonCode);
          });
          it("#toJson() -> #fromJson() -> #toJson()", () => {
            const fromJsonResult = serializer.fromJson(toJsonResult);
            expect(serializer.toJson(fromJsonResult, flavor)).toMatch(
              expectedJson,
            );
          });
          it("#toJsonCode() -> #fromJsonCode() -> #toJson()", () => {
            const fromJsonResult = serializer.fromJsonCode(
              serializer.toJsonCode(input, flavor),
            );
            expect(serializer.toJson(fromJsonResult, flavor)).toMatch(
              expectedJson,
            );
          });
        });
      }

      // Test binary serialization.
      const toBinaryFormResult = serializer.toBinaryForm(input).toBuffer();
      it("#toBinaryForm()", () => {
        const actualBase16 = toBase16(toBinaryFormResult);
        expect(actualBase16).toBe(expected.binaryFormBase16);
      });
      it("#toBinaryForm() -> #fromBinaryForm() -> #toBinaryForm()", () => {
        const fromBinaryFormResult = serializer.fromBinaryForm(
          toBinaryFormResult,
        );
        const actualBase16 = toBase16(
          serializer.toBinaryForm(fromBinaryFormResult)
            .toBuffer(),
        );
        expect(actualBase16).toBe(expected.binaryFormBase16);
      });

      return serializer.fromJson(serializer.toJson(input));
    });
  }

  deserializeZeroAndAssert(isDefaultFn: (input: T) => boolean): void {
    const { serializer } = this;

    describe("deserialize zero", () => {
      it("from JSON", () => {
        expect(isDefaultFn(serializer.fromJson(0))).toBe(true);
      });
      it("from binary", () => {
        const binaryForm = new ArrayBuffer(1);
        expect(isDefaultFn(serializer.fromBinaryForm(binaryForm))).toBe(true);
      });
    });
  }
}

function toBase16(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
