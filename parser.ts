import {
  Error,
  ErrorSink,
  FieldPath,
  Import,
  ModuleLevelDeclaration,
  MutableDeclaration,
  MutableField,
  MutableModule,
  MutableModuleLevelDeclaration,
  MutableRecord,
  MutableRecordLevelDeclaration,
  Numbering,
  Primitive,
  Procedure,
  Removed,
  Result,
  SentenceNode,
  Token,
  UnresolvedArrayType,
  UnresolvedRecordRef,
  UnresolvedType,
} from "./module.ts";
import * as casing from "./casing.ts";

/** Runs syntactic analysis on a module. */
export function parseModule(
  rootSentenceNode: SentenceNode,
  modulePath: string,
): Result<MutableModule> {
  const nameToDeclaration: { [name: string]: MutableModuleLevelDeclaration } =
    {};
  const errors: Error[] = [];
  for (const child of rootSentenceNode.children) {
    const declaration = parseDeclaration(child, "module", errors);
    if (!declaration) {
      continue;
    }
    if (
      declaration.kind === "record" || declaration.kind === "import" ||
      declaration.kind === "import-as" ||
      declaration.kind === "procedure"
    ) {
      const nameToken = declaration.name;
      const name = nameToken.text;
      if (name in nameToDeclaration) {
        errors.push({
          token: nameToken,
          message: `Duplicate identifier "${name}"`,
        });
      } else {
        nameToDeclaration[name] = declaration;
      }
    }
  }
  const declarations = Object.values(
    nameToDeclaration,
  ) as ModuleLevelDeclaration[];
  const procedures = declarations.filter((d): d is Procedure =>
    d.kind === "procedure"
  );
  return {
    result: {
      kind: "module",
      path: modulePath,
      nameToDeclaration: nameToDeclaration,
      declarations: declarations,
      // Will be populated at a later stage.
      pathToImportedNames: {},
      // Will be populated at a later stage.
      records: [],
      procedures: procedures,
    },
    errors: errors,
  };
}

function parseDeclaration(
  sentenceNode: SentenceNode,
  parentNode: "module" | "struct" | "enum",
  errorSink: ErrorSink,
): MutableDeclaration | null {
  const it = new TokenIterator(sentenceNode.tokens, errorSink);
  let recordType: "struct" | "enum" = "enum";
  const parentIsRoot = parentNode === "module";
  const expected = [
    /*0:*/ "struct",
    /*1:*/ "enum",
    /*2:*/ parentIsRoot ? null : "removed",
    /*3:*/ parentIsRoot ? null : TOKEN_IS_IDENTIFIER,
    /*4:*/ parentIsRoot ? "import" : null,
    /*5:*/ parentIsRoot ? "procedure" : null,
  ];
  const match = it.expectThenMove(expected);
  switch (match.case) {
    case 0:
      recordType = "struct";
      // Falls through.
    case 1:
      return parseRecord(it, sentenceNode.children, recordType);
    case 2:
      return parseRemoved(it, match.token);
    case 3:
      return parseField(it, match.token, parentNode as ("struct" | "enum"));
    case 4:
      return parseImport(it);
    case 5:
      return parseProcedure(it);
    default:
      return null;
  }
}

class RecordBuilder {
  constructor(
    private readonly recordName: Token,
    private readonly recordType: "struct" | "enum",
    private readonly errors: ErrorSink,
  ) {}

  addDeclaration(declaration: MutableRecordLevelDeclaration): void {
    if (this.numbering === "broken") {
      return;
    }

    let nameToken: Token | undefined;
    let errorToken: Token;
    let numbers: readonly number[] = [];
    let newNumbering = this.numbering;

    switch (declaration.kind) {
      case "field": {
        nameToken = declaration.name;
        errorToken = nameToken;
        newNumbering = declaration.number < 0 ? "implicit" : "explicit";
        if (declaration.number < 0) {
          const number = this.numbers.size;
          declaration = { ...declaration, number: number };
        }
        numbers = [declaration.number];
        break;
      }
      case "record": {
        nameToken = declaration.name;
        errorToken = nameToken;
        break;
      }
      case "removed": {
        errorToken = declaration.removedToken;
        if (declaration.numbers.length) {
          newNumbering = "explicit";
          numbers = declaration.numbers;
        } else {
          newNumbering = "implicit";
          numbers = [this.numbers.size];
        }
      }
    }

    // Make sure we're not mixing implicit and explicit numbering.
    if (this.numbering === "") {
      this.numbering = newNumbering;
    } else if (this.numbering !== newNumbering) {
      this.errors.push({
        token: errorToken,
        message: "Cannot mix implicit and explicit numbering",
      });
      this.numbering = "broken";
    }

    // Register the record/field name and make sure it's unique.
    if (nameToken !== undefined) {
      const name = nameToken.text;
      if (name in this.nameToDeclaration) {
        this.errors.push({
          token: nameToken,
          message: `Duplicate identifier "${name}"`,
        });
        return;
      }
      this.nameToDeclaration[name] = declaration;
    }

    // Register the field number and make sure it's unique.
    for (const number of numbers) {
      if (this.numbers.has(number)) {
        this.errors.push({
          token: errorToken,
          message: `Duplicate field number ${number}`,
        });
        this.numbering = "broken";
        return;
      }
      this.numbers.add(number);
    }

    // Register the removed field numbers.
    if (declaration.kind === "removed") {
      this.removedNumbers.push(...numbers);
    }
  }

  build(): MutableRecord {
    // Make sure that all field numbers are consecutive starting from 0.
    for (let i = 0; i < this.numbers.size; ++i) {
      if (this.numbers.has(i)) {
        continue;
      }
      this.errors.push({
        token: this.recordName,
        message: `Missing field number ${i}`,
      });
      break;
    }

    const declarations = Object.values(this.nameToDeclaration);
    const fields = declarations.filter(
      (d): d is MutableField => d.kind === "field",
    );
    const nestedRecords = declarations.filter(
      (d): d is MutableRecord => d.kind === "record",
    );

    // Enums must have at least one field.
    if (this.recordType === "enum" && fields.length <= 0) {
      this.errors.push({
        token: this.recordName,
        message: `Enum cannot be empty`,
      });
    }

    const { recordName } = this;
    const key = `${recordName.line.modulePath}:${recordName.position}`;

    return {
      kind: "record",
      key: key,
      name: this.recordName,
      recordType: this.recordType,
      nameToDeclaration: this.nameToDeclaration,
      declarations: Object.values(this.nameToDeclaration),
      fields: fields,
      nestedRecords: nestedRecords,
      numbering: this.numbering,
      removedNumbers: this.removedNumbers.sort(),
    };
  }

  private nameToDeclaration: { [n: string]: MutableRecordLevelDeclaration } =
    {};
  private numbers = new Set<number>();
  private numbering: Numbering = "";
  private removedNumbers: number[] = [];
}

function parseRecord(
  it: TokenIterator,
  childNodes: readonly SentenceNode[],
  recordType: "struct" | "enum",
): MutableRecord | null {
  // A struct or an enum.
  const nameMatch = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
  if (nameMatch.case < 0) {
    return null;
  }
  casing.validate(nameMatch.token, "UpperCamel", it.errors);
  if (it.expectThenMove(["{"]).case < 0) {
    return null;
  }
  const builder = new RecordBuilder(
    nameMatch.token,
    recordType,
    it.errors,
  );
  for (const childNode of childNodes) {
    const declaration = parseDeclaration(childNode, recordType, it.errors);
    if (declaration === null) {
      continue;
    }
    builder.addDeclaration(declaration as MutableRecordLevelDeclaration);
  }
  return builder.build();
}

function parseField(
  it: TokenIterator,
  name: Token,
  recordType: "struct" | "enum",
): MutableField | null {
  // May only be undefined if the type is an enum.
  let type: UnresolvedType | undefined = undefined;
  let number = -1;

  while (true) {
    const typeAllowed = type === undefined && number < 0;
    const endAllowed = type !== undefined || recordType === "enum";
    const numberAllowed = number < 0 && endAllowed;
    const expected = [
      /*0:*/ typeAllowed ? ":" : null,
      /*1:*/ numberAllowed ? "=" : null,
      /*2:*/ endAllowed ? ";" : null,
    ];
    const match = it.expectThenMove(expected);
    switch (match.case) {
      case 0: {
        type = parseType(it);
        if (type === undefined) {
          return null;
        }
        break;
      }
      case 1: {
        number = parseNumber(it);
        if (number < 0) {
          return null;
        }
        break;
      }
      case 2: {
        const expectedCasing = type ? "lower_underscore" : "UPPER_UNDERSCORE";
        casing.validate(name, expectedCasing, it.errors);
        return {
          kind: "field",
          name: name,
          number: number,
          unresolvedType: type,
          // Will be populated at a later stage.
          type: undefined,
          // Will be populated at a later stage.
          isRecursive: false,
        };
      }
      case -1:
        return null;
    }
  }
}

const PRIMITIVE_TYPES: ReadonlySet<string> = new Set<Primitive>([
  "bool",
  "int32",
  "int64",
  "uint64",
  "float32",
  "float64",
  "timestamp",
  "string",
  "bytes",
]);

function parseType(it: TokenIterator): UnresolvedType | undefined {
  const match = it.expectThenMove([
    /*0:*/ "[",
    /*1:*/ TOKEN_IS_IDENTIFIER,
    /*2:*/ ".",
  ]);
  let value: UnresolvedType | undefined;
  switch (match.case) {
    case 0: {
      // Left square bracket.
      value = parseArrayType(it);
      break;
    }
    case 1:
      // An identifier.
      if (PRIMITIVE_TYPES.has(match.token.text)) {
        value = {
          kind: "primitive",
          primitive: match.token.text as Primitive,
        };
        break;
      }
      // Falls through.
    case 2: {
      // Dot.
      value = parseRecordRef(it, match.token);
      break;
    }
    default:
      return undefined;
  }
  if (value === undefined) {
    return undefined;
  }
  if (it.peek() === "?") {
    it.next();
    return { kind: "nullable", value: value };
  } else {
    return value;
  }
}

function parseArrayType(it: TokenIterator): UnresolvedArrayType | undefined {
  const item = parseType(it);
  if (item === undefined) {
    return undefined;
  }
  let key: FieldPath | undefined = undefined;
  while (true) {
    const keyAllowed = !key && item.kind === "record";
    const match = it.expectThenMove([
      /*0:*/ keyAllowed ? "|" : null,
      /*1:*/ "]",
    ]);
    switch (match.case) {
      case 0: {
        // '|'
        key = parseFieldPath(it, match.token);
        if (key === null) {
          return undefined;
        }
        break;
      }
      case 1:
        return { kind: "array", item: item, key: key };
      default:
        return undefined;
    }
  }
}

function parseFieldPath(
  it: TokenIterator,
  pipeToken: Token,
): FieldPath | undefined {
  const fieldNames: Token[] = [];
  while (true) {
    const match = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
    if (match.case < 0) {
      return undefined;
    }
    fieldNames.push(match.token);
    if (it.peek() === ".") {
      it.next();
    } else {
      break;
    }
  }
  return {
    pipeToken: pipeToken,
    fieldNames: fieldNames,
    // Just because we need to provide a value.
    // The correct value will be populated at a later stage.
    keyType: { kind: "primitive", primitive: "bool" },
  };
}

function parseRecordRef(
  it: TokenIterator,
  nameOrDot: Token,
): UnresolvedRecordRef | undefined {
  const absolute = nameOrDot.text === ".";
  const nameParts: Token[] = [];
  if (nameOrDot.text === ".") {
    const match = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
    if (match.case < 0) {
      return undefined;
    }
    nameParts.push(match.token);
  } else {
    nameParts.push(nameOrDot);
  }
  while (it.peek() === ".") {
    it.next();
    const match = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
    if (match.case < 0) {
      return undefined;
    }
    nameParts.push(match.token);
  }
  return { kind: "record", nameParts: nameParts, absolute: absolute };
}

function parseNumber(it: TokenIterator): number {
  const match = it.expectThenMove([TOKEN_IS_NUMBER]);
  return match.case == 0 ? +match.token.text : -1;
}

// Parses the "removed" declaration.
// Assumes the current token is the token after "removed".
function parseRemoved(
  it: TokenIterator,
  removedToken: Token,
): Removed | null {
  const numbers: number[] = [];
  // The 5 states are:
  //   · '?': expect a number or a semicolon
  //   · ',': expect a comma or a semicolon
  //   · '0': expect a single number or the lower bound of a range
  //   · '-': expect a dash, a comma or a semicolon
  //   · '1': expect the upper bound of a range
  let expect: "?" | "," | "0" | "-" | "1" = "?";
  loop:
  while (true) {
    const expected: Array<string | TokenPredicate | null> = [
      /*0:*/ /[,-]/.test(expect) ? "," : null,
      /*1:*/ /[?01]/.test(expect) ? TOKEN_IS_NUMBER : null,
      /*2:*/ expect === "-" ? "-" : null,
      /*3:*/ /[?,-]/.test(expect) ? ";" : null,
    ];
    const match = it.expectThenMove(expected);
    switch (match.case) {
      case 0: {
        // A comma.
        expect = "0";
        break;
      }
      case 1: {
        // A number. We have 2 cases.
        const number = +match.token.text;
        if (/[?0]/.test(expect)) {
          expect = "-";
          numbers.push(number);
        } else {
          // A range, e.g. 2-5.
          expect = ",";
          const lastNumber = numbers[numbers.length - 1];
          if (number <= lastNumber) {
            it.errors.push({
              token: match.token,
              expected: `Number greater than ${lastNumber}`,
            });
            return null;
          }
          // Append all the numbers from `lastNumber + 1` to `number`.
          for (let i = lastNumber + 1; i <= number; ++i) {
            numbers.push(i);
          }
        }
        break;
      }
      case 2: {
        // A dash.
        expect = "1";
        break;
      }
      case 3: {
        // A semicolon.
        break loop;
      }
      case -1:
        return null;
    }
  }
  // Make sure we don't have a duplicate number.
  const seenNumbers = new Set<number>();
  for (const number of numbers) {
    if (seenNumbers.has(number)) {
      it.errors.push({
        token: removedToken,
        message: `Duplicate field number ${number}`,
      });
      return null;
    }
    seenNumbers.add(number);
  }

  return {
    kind: "removed",
    removedToken: removedToken,
    numbers: numbers,
  };
}

function parseImport(it: TokenIterator): Import | null {
  const tokenMatch = it.expectThenMove(["*", TOKEN_IS_IDENTIFIER]);
  switch (tokenMatch.case) {
    case 0:
      return parseImportAs(it);
    case 1:
      return parseImportGivenName(tokenMatch.token, it);
    default:
      return null;
  }
}

function parseImportAs(it: TokenIterator): Import | null {
  if (it.expectThenMove(["as"]).case < 0) return null;
  const aliasMatch = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
  if (aliasMatch.case < 0) {
    return null;
  }
  casing.validate(aliasMatch.token, "lower_underscore", it.errors);
  if (it.expectThenMove(["from"]).case < 0) return null;
  const modulePathMatch = it.expectThenMove([TOKEN_IS_STRING_LITERAL]);
  if (modulePathMatch.case < 0) {
    return null;
  }
  it.expectThenMove([";"]);
  return {
    kind: "import-as",
    name: aliasMatch.token,
    modulePath: modulePathMatch.token,
  };
}

function parseImportGivenName(
  firstName: Token,
  it: TokenIterator,
): Import | null {
  if (it.expectThenMove(["from"]).case < 0) return null;
  const modulePathMatch = it.expectThenMove([TOKEN_IS_STRING_LITERAL]);
  if (modulePathMatch.case < 0) {
    return null;
  }
  it.expectThenMove([";"]);
  return {
    kind: "import",
    name: firstName,
    modulePath: modulePathMatch.token,
  };
}

function parseProcedure(it: TokenIterator): Procedure | null {
  const nameMatch = it.expectThenMove([TOKEN_IS_IDENTIFIER]);
  if (nameMatch.case < 0) {
    return null;
  }
  casing.validate(nameMatch.token, "UpperCamel", it.errors);
  if (it.expectThenMove(["("]).case < 0) {
    return null;
  }
  const requestType = parseType(it);
  if (!requestType) {
    return null;
  }
  if (it.expectThenMove([")"]).case < 0 || it.expectThenMove([":"]).case < 0) {
    return null;
  }
  const responseType = parseType(it);
  if (!responseType) {
    return null;
  }

  let number: number | undefined;
  if (it.expectThenMove(["=", ";"]).case === 0) {
    number = parseNumber(it);
    if (number < 0) {
      return null;
    }
    it.expectThenMove([";"]);
  }
  if (number === undefined) {
    number = simpleHash(nameMatch.token.text);
  }

  return {
    kind: "procedure",
    name: nameMatch.token,
    unresolvedRequestType: requestType,
    unresolvedResponseType: responseType,
    // Will be populated at a later stage.
    requestType: undefined,
    // Will be populated at a later stage.
    responseType: undefined,
    number: number,
  };
}

abstract class TokenPredicate {
  abstract matches(token: string): boolean;
  abstract what(): string;
}

class TokenIsIdentifier extends TokenPredicate {
  override matches(token: string): boolean {
    return /^\w/.test(token);
  }

  override what() {
    return "identifier";
  }
}

const TOKEN_IS_IDENTIFIER = new TokenIsIdentifier();

class TokenIsNumber extends TokenPredicate {
  override matches(token: string): boolean {
    return /^[0-9]/.test(token);
  }

  override what() {
    return "number";
  }
}

const TOKEN_IS_NUMBER = new TokenIsNumber();

class TokenIsStringLiteral extends TokenPredicate {
  override matches(token: string): boolean {
    return /^["']/.test(token);
  }

  override what() {
    return "string literal";
  }
}

const TOKEN_IS_STRING_LITERAL = new TokenIsStringLiteral();

interface TokenMatch {
  case: number;
  token: Token;
}

class TokenIterator {
  constructor(
    private readonly tokens: readonly Token[],
    readonly errors: ErrorSink,
  ) {}

  // Returns both:
  //   · the index of the first predicate matching the current token, or -1 if
  //       there is none
  //   · the current token (before the move)
  //
  // If the current token matches any predicate, i.e. if the index is not -1,
  // moves to the next token before returning. Otherwise, registers an error.
  expectThenMove(
    expected: ReadonlyArray<string | TokenPredicate | null>,
  ): TokenMatch {
    const token = this.tokens[this.tokenIndex];
    for (let i = 0; i < expected.length; ++i) {
      const e = expected[i];
      if (e === null) {
        continue;
      }
      const match = (e instanceof TokenPredicate)
        ? e.matches(token.text)
        : (token.text === e);
      if (!match) {
        continue;
      }
      ++this.tokenIndex;
      return {
        case: i,
        token: token,
      };
    }

    // No match: register an error.
    const expectedParts: string[] = [];
    for (let i = 0; i < expected.length; ++i) {
      const e = expected[i];
      if (e === null) {
        continue;
      }
      expectedParts.push(e instanceof TokenPredicate ? e.what() : `"${e}"`);
    }
    const expectedMsg = expectedParts.length === 1
      ? expectedParts[0]
      : `one of: ${expectedParts.join(", ")}`;

    this.errors.push({
      token: token,
      expected: expectedMsg,
    });

    return {
      case: -1,
      token: token,
    };
  }

  peek(): string {
    return this.tokens[this.tokenIndex].text;
  }

  next(): void {
    ++this.tokenIndex;
  }

  private tokenIndex = 0;
}

function simpleHash(input: string) {
  // From https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Signed int32 to unsigned int32.
  return hash >>> 0;
}
