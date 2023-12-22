import { expect, is } from "buckwheat";
import { describe, it } from "mocha";
import { MY_PROCEDURE, WITH_EXPLICIT_NUMBER } from "./procedures.soia.ts";
import { Point } from "./structs.soia.ts";
import { JsonValue } from "./enums.soia.ts";
import * as soia from "soia";

describe("procedures", () => {
  it("works", () => {
    {
      const _: soia.Procedure<Point, JsonValue> = MY_PROCEDURE;
      expect(MY_PROCEDURE).toMatch({
        name: "MyProcedure",
        number: 1974132327,
        requestSerializer: is(Point.SERIALIZER),
        responseSerializer: is(JsonValue.SERIALIZER),
      });
    }
    {
      const _: soia.Procedure<ReadonlyArray<Point>, JsonValue | null> =
        WITH_EXPLICIT_NUMBER;
      expect(WITH_EXPLICIT_NUMBER).toMatch({
        name: "WithExplicitNumber",
        number: 3,
      });
    }
  });
});
