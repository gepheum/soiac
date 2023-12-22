export function unquoteAndUnescape(stringLiteral: string): string {
  const unquoted = stringLiteral.slice(1, -1);
  const parts = unquoted.split("\\\\");
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i].replace(/\\(\r\n|\n|\r)/g, "\\n");
    parts[i] = JSON.parse(`"${part}"`);
  }
  return parts.join("\\");
}
