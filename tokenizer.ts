import {
  CodeLine,
  Error,
  ErrorSink,
  Result,
  SentenceNode,
  Token,
} from "./module.ts";

/**
 * Tokenizes the given module and return a sentence node corresponding to the
 * root of the module.
 */
export function tokenizeModule(
  code: string,
  modulePath: string,
): Result<SentenceNode> {
  const errors: Error[] = [];
  const tokens = tokenize(code, modulePath, errors);
  const rootSentenceNode = createRootSentenceNode(tokens, errors);
  return { result: rootSentenceNode, errors: errors };
}

function tokenize(
  code: string,
  modulePath: string,
  errors: ErrorSink,
): Token[] {
  const result: Token[] = [];

  const lines = new Lines(code, modulePath);

  // Comment:                  \/\*([^*]|\*[^/])*\*\/|\/\/[^\n\r]*
  // Word:                     \w+
  // Whitespaces:              [ \n\r\t]+
  // Symbol:                   [{}\[\]\(\)*.:=;|?\-,]
  // String literal:           "[^"\n\r]*"|'[^'\n\r]*'
  // Unclosed comment:         \/\*([^*]|\*[^/]|\*$)*$
  // Unclosed string literal:  "[^"\n\r]*(\n|\r|$)|'[^"\n\r]*(\n|\r|$)
  // Invalid char sequence:    [^\w \n\r\t{}\[\]\(\)*.:=;|?\-,"']+
  //
  // To iterate on this regex, use https://regex101.com/.
  const re =
    /(\/\*([^*]|\*[^/])*\*\/|\/\/[^\n\r]*)|(\w+)|([ \n\r\t]+)|[{}\[\]\(\)*.:=;|?\-,]|("[^"\n\r]*"|'[^'\n\r]*')|(\/\*([^*]|\*[^/]|\*$)*$)|("[^"\n\r]*(\n|\r|$)|'[^"\n\r]*(\n|\r|$))|([^\w \n\r\t{}\[\]\(\)*.:=;|?\-,"']+)/g;

  let group: RegExpExecArray | null;
  while ((group = re.exec(code)) !== null) {
    const position = re.lastIndex - group[0].length;

    // Skip comments.
    if (group[1] !== undefined) continue;
    // Skip whitespaces.
    if (group[4] !== undefined) continue;

    const line = lines.advancePosition(position);
    const colNumber = position - line.position;
    const token = {
      text: group[0],
      position: position,
      line: line,
      colNumber: colNumber,
    };

    if (group[6] !== undefined) {
      errors.push({
        token: token,
        message: "Unterminated multi-line comment",
      });
      continue;
    }
    if (group[8] !== undefined) {
      errors.push({
        token: token,
        message: "Unterminated string literal",
      });
      continue;
    }
    if (group[11] !== undefined) {
      errors.push({
        token: token,
        message: "Invalid sequence of characters",
      });
      continue;
    }

    if (group[3] !== undefined) {
      if (!validateWord(token, errors)) {
        continue;
      }
    }
    if (group[5] !== undefined) {
      // A string literal.
      // At the moment, we don't need to support string escaping because string
      // literals are only used to represent module paths. But we might want to
      // support string escaping in the future, so in order not to break
      // backward compatibility when this happens, we simply forbid backslash
      // characters in string literals.
      if (token.text.includes("\\")) {
        errors.push({
          token: token,
          message: "String literal cannot contain \\",
        });
        continue;
      }
    }

    result.push(token);
  }

  // Append a special token for EOF.
  const lastLine = lines.advancePosition(code.length);
  result.push({
    text: "",
    position: code.length,
    line: lastLine,
    colNumber: lastLine.line.length,
  });

  return result;
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

interface SentenceNodeBuilder {
  readonly tokens: readonly Token[];
  readonly children: SentenceNodeBuilder[];
}

function createRootSentenceNode(
  tokens: readonly Token[],
  errors: ErrorSink,
): SentenceNode {
  const blockStack: SentenceNodeBuilder[] = [];
  // The root node will always be at position 0.
  blockStack.push({
    tokens: [],
    children: [],
  });
  // As a token index.
  let sentenceStart = 0;
  let i = 0;
  const appendSentence = () => {
    const sentenceTokens = tokens.slice(sentenceStart, i + 1);
    const sentenceNode = {
      tokens: sentenceTokens,
      children: [],
    };
    const currentBlock = blockStack[blockStack.length - 1];
    currentBlock.children.push(sentenceNode);
    sentenceStart = i + 1;
    return sentenceNode;
  };
  for (; i < tokens.length; ++i) {
    const token = tokens[i];
    if (token.text === ";") {
      appendSentence();
    } else if (token.text === "{") {
      blockStack.push(appendSentence());
    } else if (token.text === "}") {
      if (i > sentenceStart) {
        // Means that right before '}', we have a sentence which does not end
        // with ';' or '}'. This is illegal, and the error will be registered in
        // the parser.
        appendSentence();
      }
      if (blockStack.length >= 2) {
        blockStack.pop();
      } else {
        errors.push({
          token: token,
          message: "No matching left bracket",
        });
      }
      sentenceStart = i + 1;
    }
  }

  if (i > sentenceStart + 1) {
    // Means that right before EOF, we have a sentence which does not end with
    // ';' or '}'. This is illegal, and the error will be registered in the
    // parser.
    // `+ 1` is because the very last token in `tokens` is for EOF.
    appendSentence();
  }

  // Error if more than one block left in the stack.
  for (let j = 1; j < blockStack.length; ++j) {
    const block = blockStack[j];
    const leftBracket = block.tokens[block.tokens.length - 1];
    errors.push({
      token: leftBracket,
      message: "No matching right bracket",
    });
  }

  return blockStack[0];
}
