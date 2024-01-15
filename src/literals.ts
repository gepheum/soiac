import type { Primitive } from "./module.d.ts";

export function unquoteAndUnescape(stringLiteral: string): string {
  const unquoted = stringLiteral.slice(1, -1);
  const parts = unquoted.split("\\\\");
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i]!
      .replace(/\\(\r\n|\n|\r)/g, "\\n")
      // Escape unescaped double quotes which can appear in a single-quoted
      // string literal.
      .replace(/(?<=^|[^\\])"/g, '\\"');
    parts[i] = JSON.parse(`"${part}"`);
  }
  return parts.join("\\");
}

export function valueHasPrimitiveType(
  token: string,
  expectedType: Primitive,
): boolean {
  switch (expectedType) {
    case "bool":
      return token === "false" || token === "true";
    case "bytes":
      return isStringLiteral(token) &&
        /^([0-9A-Fa-f]{2})*$/.test(unquoteAndUnescape(token));
    case "timestamp": {
      if (!isStringLiteral(token)) {
        return false;
      }
      const dateTime = unquoteAndUnescape(token);
      return !Number.isNaN(new Date(dateTime).valueOf()) &&
        // A timezone is required.
        /(Z|[+-]\d\d:\d\d)$/.test(dateTime);
    }
    case "int32":
      return isIntLiteral(token, BigInt(-2147483648), BigInt(2147483647));
    case "int64":
      return isIntLiteral(
        token,
        BigInt("-9223372036854775808"),
        BigInt("9223372036854775807"),
      );
    case "uint64":
      return isIntLiteral(token, BigInt(0), BigInt("18446744073709551615"));
    case "float32":
    case "float64":
      return /^[\-0-9]/.test(token);
    case "string":
      return isStringLiteral(token);
  }
}

export function isStringLiteral(token: string): boolean {
  return /^['"]/.test(token);
}

function isIntLiteral(token: string, min: bigint, max: bigint): boolean {
  if (!/^-?[0-9]+$/.test(token)) {
    return false;
  }
  const value = BigInt(token);
  return min <= value && value <= max;
}
