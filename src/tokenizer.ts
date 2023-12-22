import { CodeLine, Error, ErrorSink, Result, Token } from "./module.ts";

/** Tokenizes the given module. */
export function tokenizeModule(
  code: string,
  modulePath: string,
): Result<Token[]> {
  const tokens: Token[] = [];
  const errors: Error[] = [];

  const lines = new Lines(code, modulePath);

  // Multiline comment:            \/\*([^*]|\*[^\/])*(\*\/)?
  // Single-line comment:          \/\/[^\n\r]*
  // Number:                       \b-?(0|[1-9][0-9]*)(\.[0-9]+)?\b
  // Word:                         \b\w+\b
  // Whitespaces:                  [ \n\r\t]+
  // Symbol:                       [{}\[\]\(\)*.:=;|?\-,]
  // Double-quote string literal:  "(\\(\n|\r|\n\r|.)|[^\\\"\n\r])*"?
  // Single-quote string literal:  '(\\(\n|\r|\n\r|.)|[^\\\'\n\r])*'?
  // Invalid char sequence:        [^\w \n\r\t{}\[\]\(\)*.:=;|?\-,"']+
  //
  // To iterate on this regex, use https://regex101.com/.
  const re =
    /(\/\*([^*]|\*[^\/])*(\*\/)?)|(\/\/[^\n\r]*)|(\b-?(0|[1-9][0-9]*)(\.[0-9]+)?)\b|\b(\w+)\b|([ \n\r\t]+)|([{}\[\]\(\)*.:=;|?\-,])|("(\\(\n|\r|\n\r|.)|[^\\\"\n\r])*"?)|('(\\(\n|\r|\n\r|.)|[^\\\'\n\r])*'?)|([^\w \n\r\t{}\[\]\(\)*.:=;|?\-,"']+)/g;

  let group: RegExpExecArray | null;
  while ((group = re.exec(code)) !== null) {
    const position = re.lastIndex - group[0].length;

    const line = lines.advancePosition(position);
    const colNumber = position - line.position;
    const token = {
      text: group[0],
      position: position,
      line: line,
      colNumber: colNumber,
    };

    // Skip multiline comments.
    if (group[1] !== undefined) {
      // Make sure the multiline comment is terminated.
      if (!group[1].endsWith("*/")) {
        errors.push({
          token: token,
          message: "Unterminated multi-line comment",
        });
      }
      continue;
    }

    // Skip single-line comments.
    if (group[4] !== undefined) continue;

    if (group[8] !== undefined) {
      if (!validateWord(token, errors)) {
        continue;
      }
    }

    // Skip whitespaces.
    if (group[9] !== undefined) continue;

    // Validate string literals.
    const stringLiteral = group[11] || group[14];
    if (stringLiteral !== undefined) {
      if (!stringLiteral.endsWith(stringLiteral[0])) {
        errors.push({
          token: token,
          message: "Unterminated string literal",
        });
        continue;
      }
      const stringLiteralRe =
        /^["'](\\(\r\n|u[0-9A-Fa-f]{4}|["'\\\/bfnrt\n\r])|[^\\])*["']$/;
      if (!stringLiteralRe.test(stringLiteral)) {
        errors.push({
          token: token,
          message: "String literal contains invalid escape sequence",
        });
        continue;
      }
    }

    // Skip invalid sequences.
    if (group[17] !== undefined) {
      errors.push({
        token: token,
        message: "Invalid sequence of characters",
      });
      continue;
    }

    tokens.push(token);
  }

  // Append a special token for EOF.
  const lastLine = lines.advancePosition(code.length);
  tokens.push({
    text: "",
    position: code.length,
    line: lastLine,
    colNumber: lastLine.line.length,
  });

  return { result: tokens, errors: errors };
}

function validateWord(token: Token, errors: ErrorSink): boolean {
  if (/^[0-9]/.test(token.text)) {
    if (!/^(0|[1-9][0-9]*)$/.test(token.text)) {
      errors.push({
        token: token,
        message: "Invalid number",
      });
      return false;
    }
    return true;
  }

  if (token.text.startsWith("_")) {
    errors.push({
      token: token,
      message: "Identifier cannot start with _",
    });
    return false;
  }
  if (token.text.endsWith("_")) {
    errors.push({
      token: token,
      message: "Identifier cannot end with _",
    });
    return false;
  }
  if (token.text.includes("__")) {
    errors.push({
      token: token,
      message: "Identifier cannot contain __ sequence",
    });
    return false;
  }
  if (/_[0-9]/.test(token.text)) {
    // The problem is we could end up with duplicate field names when converting
    // to camel case. For example: "field0" and "field_0" would both be
    // converted to "field0".
    errors.push({
      token: token,
      message: "Digit cannot follow _",
    });
    return false;
  }

  return true;
}

class Lines {
  constructor(code: string, modulePath: string) {
    const lines = this.lines;
    let lineStart = 0;
    let group: RegExpExecArray | null;
    const re = /\n|\r|\n\r|$/g;
    while ((group = re.exec(code)) !== null) {
      const match = group[0];
      const lineEnd = re.lastIndex - match.length;
      const lineString = code.substring(lineStart, lineEnd);
      lines.push({
        lineNumber: lines.length,
        line: lineString,
        position: lineStart,
        modulePath: modulePath,
      });
      // Record the position after the EOL or EOF.
      lineStart = re.lastIndex;
      if (match === "") {
        break;
      }
    }
  }

  advancePosition(position: number): CodeLine {
    const lines = this.lines;
    while (lines.length >= 2 && position >= this.lines[1].position) {
      lines.shift();
    }
    return lines[0];
  }

  private readonly lines: CodeLine[] = [];
}
