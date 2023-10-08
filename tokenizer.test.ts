import { expect } from "buckwheat";
import { describe, it } from "mocha";

import { tokenizeModule } from "./tokenizer.ts";

describe("tokenizer", () => {
  it("tokenizes module with simple struct", () => {
    const code = [
      "struct Point2d {",
      "  x: float32;",
      "  y: float32;",
      "}",
    ].join("\n");

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch({
      errors: [],
      result: {
        tokens: [],
        children: [
          {
            tokens: [
              {
                text: "struct",
                position: 0,
              },
              {
                text: "Point2d",
                position: 7,
              },
              {
                text: "{",
              },
            ],
            children: [
              {
                tokens: [
                  {
                    text: "x",
                  },
                  {
                    text: ":",
                  },
                  {
                    text: "float32",
                  },
                  {
                    text: ";",
                  },
                ],
                children: [],
              },
              {
                tokens: [
                  {
                    text: "y",
                    position: 33,
                    line: {
                      lineNumber: 2,
                      line: "  y: float32;",
                      position: 31,
                      modulePath: "path/to/module",
                    },
                    colNumber: 2,
                  },
                  {
                    text: ":",
                  },
                  {
                    text: "float32",
                  },
                  {
                    text: ";",
                  },
                ],
                children: [],
              },
            ],
          },
        ],
      },
    });
  });

  it("tokenizes module with nested records", () => {
    const code = [
      "struct A {",
      "  enum B {",
      "    struct C {",
      "      x: float32;",
      "    }",
      "  }",
      "}",
    ].join("\n");

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [],
        result: {
          tokens: [],
          children: [
            {
              tokens: [
                {
                  text: "struct",
                },
                {
                  text: "A",
                },
                {
                  text: "{",
                },
              ],
              children: [
                {
                  tokens: [
                    {
                      text: "enum",
                    },
                    {
                      text: "B",
                    },
                    {
                      text: "{",
                    },
                  ],
                  children: [
                    {
                      tokens: [
                        {
                          text: "struct",
                        },
                        {
                          text: "C",
                        },
                        {
                          text: "{",
                        },
                      ],
                      children: [
                        {
                          tokens: [
                            {
                              text: "x",
                            },
                            {
                              text: ":",
                            },
                            {
                              text: "float32",
                            },
                            {
                              text: ";",
                            },
                          ],
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    );
  });

  it("tokenizes module with complex types", () => {
    const code = [
      "struct Foos {",
      "  foos: [foo.Foo]?;",
      "  bars: [Bar|key];",
      "}",
    ].join("\n");

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [],
        result: {
          tokens: [],
          children: [
            {
              tokens: [
                {
                  text: "struct",
                },
                {
                  text: "Foos",
                },
                {
                  text: "{",
                },
              ],
              children: [
                {
                  tokens: [
                    {
                      text: "foos",
                    },
                    {
                      text: ":",
                    },
                    {
                      text: "[",
                    },
                    {
                      text: "foo",
                    },
                    {
                      text: ".",
                    },
                    {
                      text: "Foo",
                    },
                    {
                      text: "]",
                    },
                    {
                      text: "?",
                    },
                    {
                      text: ";",
                    },
                  ],
                  children: [],
                },
                {
                  tokens: [
                    {
                      text: "bars",
                    },
                    {
                      text: ":",
                    },
                    {
                      text: "[",
                    },
                    {
                      text: "Bar",
                    },
                    {
                      text: "|",
                    },
                    {
                      text: "key",
                    },
                    {
                      text: "]",
                    },
                    {
                      text: ";",
                    },
                  ],
                  children: [],
                },
              ],
            },
          ],
        },
      },
    );
  });

  it("tokenizes module with import", () => {
    const code = [
      "import foo from './path/😊/foo';",
      'import * as bar from "path/to/bar";',
    ].join("\n");

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        result: {
          tokens: [],
          children: [
            {
              tokens: [
                {
                  text: "import",
                },
                {
                  text: "foo",
                },
                {
                  text: "from",
                },
                {
                  text: "'./path/😊/foo'",
                },
                {
                  text: ";",
                },
              ],
              children: [],
            },
            {
              tokens: [
                {
                  text: "import",
                },
                {
                  text: "*",
                },
                {
                  text: "as",
                },
                {
                  text: "bar",
                },
                {
                  text: "from",
                },
                {
                  text: '"path/to/bar"',
                },
                {
                  text: ";",
                },
              ],
              children: [],
            },
          ],
        },
      },
    );
  });

  it("tokenizes module with comments", () => {
    const code = [
      "// Single-line comment",
      "struct Foo { /* Multi-line",
      "comment 😊 */ }",
    ].join("\n");

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        result: {
          tokens: [],
          children: [
            {
              tokens: [
                {
                  text: "struct",
                },
                {
                  text: "Foo",
                },
                {
                  text: "{",
                },
              ],
              children: [],
            },
          ],
        },
      },
    );
  });

  it("tokenizes module with unterminated multi-line comment", () => {
    const code = "  /*";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: {
              text: "/*",
              position: 2,
            },
            message: "Unterminated multi-line comment",
          },
        ],
      },
    );
  });

  it("tokenizes module with unterminated string literal", () => {
    const code = "import 'foo";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: {
              text: "'foo",
              position: 7,
            },
            message: "Unterminated string literal",
          },
        ],
      },
    );
  });

  it("tokenizes module with invalid char sequence", () => {
    const code = "  ##";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: {
              text: "##",
              position: 2,
            },
            message: "Invalid sequence of characters",
          },
        ],
      },
    );
  });

  it("tokenizes module with backslash in string literal", () => {
    const code = "import 'foo\\';";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: {
              text: "'foo\\'",
              position: 7,
            },
            message: "String literal cannot contain \\",
          },
        ],
      },
    );
  });

  it("tokenizes module with invalid word", () => {
    const code = "00 1_ 2a";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: { text: "00" },
            message: "Invalid number",
          },
          {
            token: { text: "1_" },
            message: "Invalid number",
          },
          {
            token: { text: "2a" },
            message: "Invalid number",
          },
        ],
      },
    );
  });

  it("tokenizes module with invalid identifiers", () => {
    const code = "_a a_ a__a a_0";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            message: "Identifier cannot start with _",
          },
          {
            message: "Identifier cannot end with _",
          },
          {
            message: "Identifier cannot contain __ sequence",
          },
          {
            message: "Digit cannot follow _",
          },
        ],
      },
    );
  });

  it("tokenizes module with unmatched left bracket", () => {
    const code = "struct Foo {";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: { text: "{", position: 11 },
            message: "No matching right bracket",
          },
        ],
      },
    );
  });

  it("tokenizes module with unmatched right bracket", () => {
    const code = "struct Foo {}}";

    const actual = tokenizeModule(code, "path/to/module");

    expect(actual).toMatch(
      {
        errors: [
          {
            token: { text: "}", position: 13 },
            message: "No matching left bracket",
          },
        ],
      },
    );
  });
});
