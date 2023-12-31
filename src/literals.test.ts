import { describe, it } from "mocha";
import { expect } from "buckwheat";
import {
  isStringLiteral,
  unquoteAndUnescape,
  valueHasPrimitiveType,
} from "./literals.ts";

describe("literals", () => {
  it("#unquoteAndUnescape() works", () => {
    expect(unquoteAndUnescape('"foo\\\r\n\\\n\\\r\\tbar\\\\t"')).toBe([
      "foo",
      "",
      "",
      "\tbar\\t",
    ].join("\n"));
  });

  it("#isStringLiteral() works", () => {
    expect(isStringLiteral('"foo"')).toBe(true);
    expect(isStringLiteral('""')).toBe(true);
    expect(isStringLiteral("3")).toBe(false);
  });

  describe("#valueHasPrimitiveType()", () => {
    it("works with bool", () => {
      expect(valueHasPrimitiveType("true", "bool")).toBe(true);
      expect(valueHasPrimitiveType("false", "bool")).toBe(true);
      expect(valueHasPrimitiveType("'true'", "bool")).toBe(false);
    });

    it("works with bytes", () => {
      expect(valueHasPrimitiveType("'09afAF'", "bytes")).toBe(true);
      expect(valueHasPrimitiveType('"09afAF"', "bytes")).toBe(true);
      expect(valueHasPrimitiveType("'09afAFa'", "bytes")).toBe(false);
      expect(valueHasPrimitiveType("'09afAG'", "bytes")).toBe(false);
    });

    it("works with timestamp", () => {
      expect(valueHasPrimitiveType("'2023-12-25Z'", "timestamp")).toBe(true);
      expect(valueHasPrimitiveType('"2023-12-25T12:00+08:30"', "timestamp"))
        .toBe(true);
      expect(valueHasPrimitiveType('"2023-12-25"', "timestamp")).toBe(false);
      expect(valueHasPrimitiveType('"now"', "timestamp")).toBe(false);
    });

    it("works with int32", () => {
      expect(valueHasPrimitiveType("-2147483648", "int32")).toBe(true);
      expect(valueHasPrimitiveType("2147483647", "int32")).toBe(true);
      expect(valueHasPrimitiveType("-2147483649", "int32")).toBe(false);
      expect(valueHasPrimitiveType("2147483648", "int32")).toBe(false);
      expect(valueHasPrimitiveType("3.14", "int32")).toBe(false);
    });

    it("works with int64", () => {
      expect(valueHasPrimitiveType("-9223372036854775808", "int64")).toBe(true);
      expect(valueHasPrimitiveType("9223372036854775807", "int64")).toBe(true);
      expect(valueHasPrimitiveType("-9223372036854775809", "int64")).toBe(
        false,
      );
      expect(valueHasPrimitiveType("9223372036854775808", "int64")).toBe(false);
      expect(valueHasPrimitiveType("3.14", "int64")).toBe(false);
    });

    it("works with uint64", () => {
      expect(valueHasPrimitiveType("0", "uint64")).toBe(true);
      expect(valueHasPrimitiveType("18446744073709551615", "uint64")).toBe(
        true,
      );
      expect(valueHasPrimitiveType("18446744073709551616", "uint64")).toBe(
        false,
      );
      expect(valueHasPrimitiveType("3.14", "uint64")).toBe(false);
    });

    it("works with float32", () => {
      expect(valueHasPrimitiveType("0", "float32")).toBe(true);
      expect(valueHasPrimitiveType("-10", "float32")).toBe(true);
      expect(valueHasPrimitiveType("3.14", "float32")).toBe(true);
      expect(valueHasPrimitiveType("-3.14", "float32")).toBe(true);
      expect(valueHasPrimitiveType("'-3.14'", "float32")).toBe(false);
    });

    it("works with float64", () => {
      expect(valueHasPrimitiveType("0", "float64")).toBe(true);
      expect(valueHasPrimitiveType("-10", "float64")).toBe(true);
      expect(valueHasPrimitiveType("3.14", "float64")).toBe(true);
      expect(valueHasPrimitiveType("-3.14", "float64")).toBe(true);
      expect(valueHasPrimitiveType("'-3.14'", "float64")).toBe(false);
    });

    it("works with string", () => {
      expect(valueHasPrimitiveType("''", "string")).toBe(true);
      expect(valueHasPrimitiveType('""', "string")).toBe(true);
      expect(valueHasPrimitiveType("'foo'", "string")).toBe(true);
      expect(valueHasPrimitiveType('"foo"', "string")).toBe(true);
      expect(valueHasPrimitiveType("3", "string")).toBe(false);
    });
  });
});
