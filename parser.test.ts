import { describe, it } from "mocha";
import { expect } from "buckwheat";
import { parseModule } from "./parser.ts";
import { tokenizeModule } from "./tokenizer.ts";
import { Module, Result } from "./module.ts";

function parse(contents: string): Result<Module> {
  const pathToModule = "path/to/module";
  const tokenizerResult = tokenizeModule(contents, pathToModule);
  return parseModule(tokenizerResult.result, pathToModule);
}

describe("module parser", () => {
  it("parses module with simple struct", () => {
    const actualModule = parse(`
      struct Point {
        x: float32;
        y: float32;
        removed;
      }`);
    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Point: {
            kind: "record",
            name: {
              text: "Point",
            },
            recordType: "struct",
            nameToDeclaration: {
              x: {
                kind: "field",
                name: {
                  text: "x",
                },
                number: 0,
                unresolvedType: {
                  kind: "primitive",
                  primitive: "float32",
                },
                isRecursive: false,
              },
              y: {
                kind: "field",
                name: {
                  text: "y",
                },
                number: 1,
                unresolvedType: {
                  kind: "primitive",
                  primitive: "float32",
                },
                isRecursive: false,
              },
            },
            fields: [
              {
                name: {
                  text: "x",
                },
              },
              {
                name: {
                  text: "y",
                },
              },
            ],
            nestedRecords: [],
            numbering: "implicit",
            removedNumbers: [
              2,
            ],
          },
        },
      },
      errors: [],
    });
  });

  it("parses struct with explicit numbering", () => {
    const actualModule = parse(`
      struct Point {
        x: float32 = 1;
        y: float32 = 0;
      }`);

    expect(actualModule).toMatch({
      result: {
        nameToDeclaration: {
          Point: {
            nameToDeclaration: {
              x: {
                number: 1,
              },
              y: {
                number: 0,
              },
            },
            numbering: "explicit",
          },
        },
      },
      errors: [],
    });
  });

  it("parse simple enum", () => {
    const actualModule = parse(`
      enum Enum {
        CONSTANT;
        value_field: bool;
      }`);

    expect(actualModule).toMatch({
      result: {
        nameToDeclaration: {
          Enum: {
            kind: "record",
            name: {
              text: "Enum",
            },
            recordType: "enum",
            nameToDeclaration: {
              CONSTANT: {
                kind: "field",
                name: {
                  text: "CONSTANT",
                },
                number: 0,
              },
              "value_field": {
                kind: "field",
                name: {
                  text: "value_field",
                },
                number: 1,
                unresolvedType: {
                  kind: "primitive",
                },
                isRecursive: false,
              },
            },
            fields: [
              {
                kind: "field",
                name: {
                  text: "CONSTANT",
                },
              },
              {
                kind: "field",
                name: {
                  text: "value_field",
                },
              },
            ],
          },
        },
      },
      errors: [],
    });
  });

  it("parses nested struct", () => {
    const actualModule = parse(`
    struct Foo {
      struct Bar {}
    }`);

    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Foo: {
            kind: "record",
            name: {
              text: "Foo",
            },
            recordType: "struct",
            nameToDeclaration: {
              Bar: {
                kind: "record",
                name: {
                  text: "Bar",
                },
                recordType: "struct",
              },
            },
            nestedRecords: [
              {
                kind: "record",
                name: {
                  text: "Bar",
                },
                recordType: "struct",
              },
            ],
          },
        },
      },
      errors: [],
    });
  });

  it("parses struct with all possible types", () => {
    const actualModule = parse(`
      struct AllTypes {
        bool: bool;
        int32: int32;
        int64: int64;
        uint64: uint64;
        float32: float32;
        float64: float64;
        tsmillis: tsmillis;
        string: string;
        bytes: bytes;
        strings: [string?];
        foos: [Foo@x.y];
      }`);

    expect(actualModule).toMatch({
      result: {
        nameToDeclaration: {
          AllTypes: {
            nameToDeclaration: {
              bool: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "bool",
                },
              },
              int32: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "int32",
                },
              },
              int64: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "int64",
                },
              },
              uint64: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "uint64",
                },
              },
              float32: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "float32",
                },
              },
              float64: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "float64",
                },
              },
              tsmillis: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "tsmillis",
                },
              },
              string: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "string",
                },
              },
              bytes: {
                unresolvedType: {
                  kind: "primitive",
                  primitive: "bytes",
                },
              },
              strings: {
                unresolvedType: {
                  kind: "array",
                  item: {
                    kind: "nullable",
                    value: {
                      kind: "primitive",
                      primitive: "string",
                    },
                  },
                },
              },
              foos: {
                unresolvedType: {
                  kind: "array",
                  item: {
                    kind: "record",
                    nameParts: [
                      {
                        text: "Foo",
                        position: 282,
                        line: {
                          lineNumber: 12,
                          line: "        foos: [Foo@x.y];",
                          position: 267,
                          modulePath: "path/to/module",
                        },
                        colNumber: 15,
                      },
                    ],
                    absolute: false,
                  },
                  key: {
                    atToken: {
                      text: "@",
                      position: 285,
                      line: {
                        lineNumber: 12,
                        line: "        foos: [Foo@x.y];",
                        position: 267,
                        modulePath: "path/to/module",
                      },
                      colNumber: 18,
                    },
                    fieldNames: [
                      {
                        text: "x",
                        position: 286,
                        line: {
                          lineNumber: 12,
                          line: "        foos: [Foo@x.y];",
                          position: 267,
                          modulePath: "path/to/module",
                        },
                        colNumber: 19,
                      },
                      {
                        text: "y",
                        position: 288,
                        line: {
                          lineNumber: 12,
                          line: "        foos: [Foo@x.y];",
                          position: 267,
                          modulePath: "path/to/module",
                        },
                        colNumber: 21,
                      },
                    ],
                    keyType: {
                      kind: "primitive",
                      primitive: "bool",
                    },
                  },
                },
              },
            },
          },
        },
      },
      errors: [],
    });
  });

  it("parses module with imports", () => {
    const actualModule = parse(`
    import foo from './path/😊/foo';
    import * as bar from "path/to/bar";`);

    expect(actualModule).toMatch({
      result: {
        nameToDeclaration: {
          foo: {
            kind: "import",
            name: {
              text: "foo",
            },
            modulePath: {
              text: "'./path/😊/foo'",
            },
          },
          bar: {
            kind: "import-as",
            name: {
              text: "bar",
            },
            modulePath: {
              text: '"path/to/bar"',
            },
          },
        },
      },
      errors: [],
    });
  });

  it("parses module with duplicate identifier", () => {
    const actualModule = parse(`
      struct A {}
      struct A {}`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "A",
          line: {
            lineNumber: 2,
          },
        },
        message: 'Duplicate identifier "A"',
      }],
    });
  });

  it("parses struct with duplicate identifier", () => {
    const actualModule = parse(`
      struct A {
        a: bool;
        a: bool;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "a",
          line: {
            lineNumber: 3,
          },
        },
        message: 'Duplicate identifier "a"',
      }],
    });
  });

  it("parses struct with mixed numbering", () => {
    const actualModule = parse(`
    struct A {
      a: bool;
      b: bool = 1;
    }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "b",
        },
        message: "Cannot mix implicit and explicit numbering",
      }],
    });
  });

  it("parses struct with removed fields and mixed numbering", () => {
    const actualModule = parse(`
      struct A {
        removed;
        b: bool = 1;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "b",
        },
        message: "Cannot mix implicit and explicit numbering",
      }],
    });
  });

  it("parses struct with duplicate number", () => {
    const actualModule = parse(`
      struct A {
        a: bool = 0;
        b: bool = 0;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "b",
        },
        message: "Duplicate field number 0",
      }],
    });
  });

  it("parse struct with duplicate number in removed declaration", () => {
    const actualModule = parse(`
      struct A {
        removed 0-2, 5, 2-4;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "removed",
        },
        message: "Duplicate field number 2",
      }],
    });
  });

  it("parses struct with removed fields and duplicate number", () => {
    const actualModule = parse(`
      struct A {
        a: bool = 0;
        removed 0;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "removed",
        },
        message: "Duplicate field number 0",
      }],
    });
  });

  it("parse struct with missing number", () => {
    const actualModule = parse(`
      struct A {
        a: bool = 2;
        b: bool = 0;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "A",
        },
        message: "Missing field number 1",
      }],
    });
  });

  it("parses enum with missing number", () => {
    const actualModule = parse(`
      enum A {
        A = 2;
        b: bool = 0;
      }`);

    expect(actualModule).toMatch({
      errors: [{
        token: {
          text: "A",
        },
        message: "Missing field number 1",
      }],
    });
  });

  it("parses struct with removed fields", () => {
    const actualModule = parse(`
      struct Point {
        removed;
        a: bool;
        removed;
      }`);

    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Point: {
            removedNumbers: [0, 2],
          },
        },
        pathToImportedNames: {},
        records: [],
      },
      "errors": [],
    });
  });

  it("parses struct with removed fields and explicit numbering", () => {
    const actualModule = parse(`
      struct Point {
        removed 3, 4-6;
        removed 0-2;
      }`);

    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Point: {
            removedNumbers: [0, 1, 2, 3, 4, 5, 6],
          },
        },
        pathToImportedNames: {},
        records: [],
      },
      errors: [],
    });
  });

  it("parses empty struct", () => {
    const actualModule = parse(`
    struct Point {}`);

    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Point: {
            kind: "record",
            name: {
              text: "Point",
            },
            recordType: "struct",
            numbering: "",
          },
        },
      },
      errors: [],
    });
  });

  it("parses empty enum", () => {
    const actualModule = parse(`
    enum Enum {
      removed;
    }`);

    expect(actualModule).toMatch({
      errors: [
        {
          token: {
            text: "Enum",
          },
          message: "Enum cannot be empty",
        },
      ],
    });
  });

  it("parses removed declaration with invalid range", () => {
    const actualModule = parse(`
    struct Foo {
      removed 3-2;
    }`);

    expect(actualModule).toMatch({
      errors: [
        {
          token: {
            text: "2",
          },
          expected: "Number greater than 3",
        },
      ],
    });
  });

  it("parses procedure", () => {
    const actualModule = parse(`
      procedure Search(req):resp;`);

    expect(
      actualModule,
    ).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Search: {
            kind: "procedure",
            name: {
              text: "Search",
            },
            unresolvedRequestType: {
              kind: "record",
              nameParts: [{
                text: "req",
              }],
            },
            unresolvedResponseType: {
              kind: "record",
              nameParts: [{
                text: "resp",
              }],
            },
            number: 2472497608,
          },
        },
        procedures: [{
          kind: "procedure",
          name: {
            text: "Search",
          },
          number: 2472497608,
        }],
      },
      errors: [],
    });
  });

  it("parse procedure with explicit number", () => {
    const actualModule = parse(`
    procedure Search(req):resp = 200;`);

    expect(actualModule).toMatch({
      result: {
        kind: "module",
        path: "path/to/module",
        nameToDeclaration: {
          Search: {
            kind: "procedure",
            name: {
              text: "Search",
            },
            unresolvedRequestType: {
              kind: "record",
              nameParts: [{
                text: "req",
              }],
            },
            unresolvedResponseType: {
              kind: "record",
              nameParts: [{
                text: "resp",
              }],
            },
            number: 200,
          },
        },
        procedures: [{
          kind: "procedure",
          name: {
            text: "Search",
          },
          number: 200,
        }],
      },
      errors: [],
    });
  });
});
