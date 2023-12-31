// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

import { JsonValue as JsonValue } from "./enums.soia.ts";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const ONE_CONSTANT = JsonValue.fromCopyable({
  kind: "array",
  value: $._toFrozenArray(
    [
      JsonValue.fromCopyable({
        kind: "boolean",
        value: true,
      }),
      JsonValue.fromCopyable({
        kind: "number",
        value: 3.14,
      }),
      JsonValue.fromCopyable({
        kind: "string",
        value: "\n        foo\n        bar",
      }),
      JsonValue.fromCopyable({
        kind: "object",
        value: $._toFrozenArray(
          [
            JsonValue.Pair.create({
              name: "foo",
              value: JsonValue.fromCopyable("NULL"),
            }),
          ],
          (e) => e,
        ),
      }),
    ],
    (e) => e,
  ),
});
