// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

import { JsonValue as JsonValue } from "./enums.soia.ts";
import { Point as Point } from "./structs.soia.ts";

// -----------------------------------------------------------------------------
// Procedures
// -----------------------------------------------------------------------------

export const MY_PROCEDURE: $.Procedure<Point, JsonValue> = {
  name: "MyProcedure",
  number: 1974132327,
  requestSerializer: Point.SERIALIZER,
  responseSerializer: JsonValue.SERIALIZER,
};

export const WITH_EXPLICIT_NUMBER: $.Procedure<ReadonlyArray<Point>, JsonValue | null> = {
  name: "WithExplicitNumber",
  number: 3,
  requestSerializer: $.arraySerializer(Point.SERIALIZER),
  responseSerializer: $.nullableSerializer(JsonValue.SERIALIZER),
};

