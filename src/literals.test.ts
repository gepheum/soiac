import { describe, it } from "mocha";
import { expect } from "buckwheat";
import { unquoteAndUnescape } from "./literals.ts";

describe("literals", () => {
  it("unquoteAndUnescape() works", () => {
    expect(unquoteAndUnescape('"foo\\\r\n\\\n\\\r\\tbar\\\\t"')).toBe([
      "foo",
      "",
      "",
      "\tbar\\t",
    ].join("\n"));
  });
});
