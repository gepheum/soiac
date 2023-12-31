import { expect } from "buckwheat";
import { describe, it } from "mocha";
import { ONE_CONSTANT } from "./constants.soia.ts";

describe("module-level constants", () => {
  it("work", () => {
    expect(ONE_CONSTANT).toMatch({
      kind: "array",
      value: [
        {
          kind: "boolean",
          value: true,
        },
        {
          kind: "number",
          value: 3.14,
        },
        {
          kind: "string",
          value: [
            "",
            "        foo",
            "        bar",
          ].join("\n"),
        },
        {
          kind: "object",
          value: [
            {
              name: "foo",
              value: {
                kind: "NULL",
                value: undefined,
              },
            },
          ],
        },
      ],
    });
  });
});
