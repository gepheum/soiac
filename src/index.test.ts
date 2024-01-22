import * as exports from "./index.js";
import { describe, it } from "mocha";
import { expect } from "buckwheat";

describe("index.ts", () => {
  it("exports the right symbols", () => {
    // The actual logic is covered in other unit tests.
    // Here we just want to make sure the right symbols are exported.
    let _: exports.Module;
    expect(exports.convert("foo", "lowerCamel", "UPPER_UNDERSCORE")).toBe(
      "FOO",
    );
    expect(exports.capitalize("foo")).toBe("Foo");
    expect(exports.unquoteAndUnescape('"foo"')).toBe("foo");
  });
});
