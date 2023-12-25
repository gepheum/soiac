// Type declarations for representing the result of parsing a module.

// -----------------------------------------------------------------------------
// LEXICAL ANALYSIS
// -----------------------------------------------------------------------------

/** One line in a module. */
export interface CodeLine {
  /** Zero-based. */
  readonly lineNumber: number;
  readonly line: string;
  readonly position: number;
  readonly modulePath: string;
}

/** A lexical token. */
export interface Token {
  /** Empty if the token is the special token for EOF. */
  readonly text: string;
  /** Measured in number of characters from the start of the module. */
  readonly position: number;
  readonly line: CodeLine;
  /** Zero-based. */
  readonly colNumber: number;
}

// -----------------------------------------------------------------------------
// ERROR HANDLING
// -----------------------------------------------------------------------------

/** A user error in a module. */
export type Error =
  | { readonly token: Token; readonly message: string }
  | { readonly token: Token; readonly expected: string; message?: undefined };

export interface ErrorSink {
  push(error: Error): void;
}

/**
 * Holds a value of type T and possible errors registered during the computation
 * of the value.
 */
export interface Result<T> {
  readonly result: T;
  readonly errors: readonly Error[];
}

// -----------------------------------------------------------------------------
// SYNTACTIC ANALYSIS
// -----------------------------------------------------------------------------

export type Primitive =
  | "bool"
  | "int32"
  | "int64"
  | "uint64"
  | "float32"
  | "float64"
  | "timestamp"
  | "string"
  | "bytes";

export interface PrimitiveType {
  kind: "primitive";
  primitive: Primitive;
}

/**
 * A reference to a record, e.g. 'Foobar' or 'foo.Bar' or '.Foo.Bar'.
 * One of the possible unresolved value types. The corresponding resolved value
 * type is `ResolvedRecordRef`.
 */
export interface UnresolvedRecordRef {
  readonly kind: "record";

  /**
   * The different pieces in the name, e.g. ['Foo', 'Bar'].
   * Cannot be empty.
   */
  readonly nameParts: readonly Token[];

  /**
   * True if the reference starts with a dot, e.g. ".Foo.Bar".
   * In this example, "Foo" is to be found at the top-level of the module.
   */
  readonly absolute: boolean;
}

/** Uniquely identifies a record within a module set. */
export type RecordKey = string;

export interface ResolvedRecordRef {
  readonly kind: "record";
  readonly key: RecordKey;
  readonly recordType: "struct" | "enum";
  /**
   * Last token in the type reference. For example, if the type reference is
   * ".Foo.Bar", this is the token for "Bar".
   */
  readonly refToken: Token;
}

/** A field or a sequence of field for keying items in an array. */
export interface MutableFieldPath {
  /** The "|" token. */
  readonly pipeToken: Token;
  /** A non-empty sequence of field names. */
  readonly fieldNames: readonly Token[];
  keyType: PrimitiveType | ResolvedRecordRef;
}

export type FieldPath<Mutable extends boolean = boolean> = //
  Mutable extends true //
    ? MutableFieldPath
    : Readonly<MutableFieldPath>;

export interface ArrayType<
  Type = ResolvedType,
  Mutable extends boolean = boolean,
> {
  readonly kind: "array";
  readonly item: Type;
  /**
   * If set, the value obtained by following the field path from an item can be
   * used as a unique key for the item. The user takes responsibility for
   * ensuring that not two items in the array have the same key.
   * The item type must be a struct type.
   */
  readonly key: FieldPath<Mutable> | undefined;
}

export type UnresolvedArrayType = ArrayType<UnresolvedType>;
export type MutableArrayType = ArrayType<ResolvedType, true>;

export interface NullableType<Type = ResolvedType> {
  readonly kind: "nullable";
  readonly value: Type;
}

/**
 * Result of parsing a type from a `.soia` file, without resolving the record
 * references.
 */
export type UnresolvedType =
  | PrimitiveType
  | UnresolvedRecordRef
  | UnresolvedArrayType
  | NullableType<UnresolvedType>;

/**
 * Result of recursively resolving the record references in an unresolved type.
 * When Mutable is true, the optional field path of an array type can be
 * modified.
 */
export type ResolvedType<Mutable extends boolean = boolean> =
  | PrimitiveType
  | ResolvedRecordRef
  | ArrayType<ResolvedType, Mutable>
  | NullableType<ResolvedType<Mutable>>;

export type MutableResolvedType = ResolvedType<true>;

/** Field of a struct or enum. */
export interface MutableField<Mutable extends boolean = true> {
  readonly kind: "field";
  readonly name: Token;
  readonly number: number;
  /** May only be undefined if the field is a constant in an enum. */
  readonly unresolvedType: UnresolvedType | undefined;
  /** May only be undefined if the field is a constant in an enum. */
  type: ResolvedType<Mutable> | undefined;
  /** True if the value type of the field depends on the field's record. */
  isRecursive: boolean;
}

/** Field of a struct or enum. */
export type Field<Mutable extends boolean = boolean> = //
  Mutable extends true ? MutableField
    : Readonly<MutableField<false>>;

/** A 'removed' declaration in a struct or enum. */
export interface Removed {
  readonly kind: "removed";
  /** The 'removed' keyword token. */
  readonly removedToken: Token;
  readonly numbers: readonly number[];
}

/** A declaration within a record. */
export type RecordLevelDeclaration<Mutable extends boolean = boolean> =
  | Field
  | Removed
  | Record<Mutable>;

export type MutableRecordLevelDeclaration = RecordLevelDeclaration<true>;

export type Numbering =
  // The record does not have fields.
  | ""
  // Field numbers are not explicit in the schema.
  | "implicit"
  // Field numbers are explicit in the schema.
  | "explicit"
  // The record has both fields with implicit and explicit numbering.
  | "broken";

/** Definition of a struct or enum type. */
export interface Record<Mutable extends boolean = boolean> {
  readonly kind: "record";
  /** Uniquely identifies the record within the module set. */
  readonly key: RecordKey;
  readonly name: Token;
  readonly recordType: "struct" | "enum";
  /** Maps a field or nested record name to the corresponding declaration. */
  readonly nameToDeclaration: { [n: string]: RecordLevelDeclaration<Mutable> };
  readonly declarations: ReadonlyArray<RecordLevelDeclaration<Mutable>>;
  readonly fields: readonly Field<Mutable>[];
  readonly nestedRecords: readonly Record<Mutable>[];
  readonly numbering: Numbering;
  readonly removedNumbers: readonly number[];
}

export type MutableRecord = Record<true>;

export interface Import {
  readonly kind: "import" | "import-as";
  /** The token corresponding to the imported name or the alias. */
  readonly name: Token;
  /** The token corresponding to the quoted string. */
  readonly modulePath: Token;
}

export interface MutableProcedure<Mutable extends boolean = true> {
  readonly kind: "procedure";
  readonly name: Token;
  readonly unresolvedRequestType: UnresolvedType;
  readonly unresolvedResponseType: UnresolvedType;
  requestType: ResolvedType<Mutable> | undefined;
  responseType: ResolvedType<Mutable> | undefined;
  // A hash of the name, or the explicit number specified after "=" if any.
  readonly number: number;
}

export type Procedure<Mutable extends boolean = boolean> = //
  Mutable extends true ? MutableProcedure
    : Readonly<MutableProcedure<false>>;

/** A `const` declaration. */
export interface MutableConstant<Mutable extends boolean = true> {
  readonly kind: "constant";
  readonly name: Token;
  readonly unresolvedType: UnresolvedType;
  type: ResolvedType<Mutable> | undefined;
  readonly value: Value;
}

export type Constant<Mutable extends boolean = boolean> = //
  Mutable extends true //
    ? MutableConstant //
    : Readonly<MutableConstant<false>>;

/** A name:value entry of an object. */
export interface MutableObjectEntry<Mutable extends boolean = true> {
  readonly name: Token;
  readonly value: Value;
}

export type ObjectEntry = MutableObjectEntry<boolean>;

/** An object value, for example `{r: 255, g: 0, b: 0}`. */
export interface MutableObjectValue<Mutable extends boolean = true> {
  readonly kind: "object";
  readonly token: Token;
  readonly entries: Readonly<{ [f: string]: ObjectEntry }>;
  type?: ResolvedType<Mutable>;
}

export type ObjectValue<Mutable extends boolean = boolean> = //
  Mutable extends true //
    ? MutableObjectValue
    : Readonly<MutableObjectValue<false>>;

/** An array value, for example `[0, 1, 2]`. */
export interface MutableArrayValue<Mutable extends boolean = true> {
  readonly kind: "array";
  readonly token: Token;
  readonly items: readonly Value[];
  type?: ResolvedType<Mutable>;
}

export type ArrayValue<Mutable extends boolean = boolean> = //
  Mutable extends true //
    ? MutableArrayValue //
    : Readonly<MutableArrayValue<false>>;

/** One of: a quoted string, a number, `true`, `false`. */
export interface MutableLiteralValue<Mutable extends boolean = true> {
  readonly kind: "literal";
  readonly token: Token;
  type?: ResolvedType<Mutable>;
}

export type LiteralValue<Mutable extends boolean = boolean> = //
  Mutable extends true //
    ? MutableLiteralValue //
    : Readonly<MutableLiteralValue<false>>;

/** The value on the right side of the `=` symbol of a `const` declaration. */
export type Value<Mutable extends boolean = boolean> =
  | ObjectValue<Mutable>
  | ArrayValue<Mutable>
  | LiteralValue<Mutable>;

export type MutableValue = Value<true>;

/** A declaration which can appear at the top-level of a module. */
export type ModuleLevelDeclaration<Mutable extends boolean = boolean> =
  | Record<Mutable>
  | Import
  | Procedure<Mutable>
  | Constant<Mutable>;

export type MutableModuleLevelDeclaration = ModuleLevelDeclaration<true>;

export type Declaration<Mutable extends boolean = boolean> =
  | RecordLevelDeclaration<Mutable>
  | ModuleLevelDeclaration<Mutable>;

export type MutableDeclaration = Declaration<true>;

/**
 * Contains the definition of a record and information about where the record
 * was defined.
 */
export interface RecordLocation<Mutable extends boolean = boolean> {
  readonly kind: "record-location";
  readonly record: Record<Mutable>;
  /**
   * Chain of records from the top-level record to `record` included.
   * Every record is nested within the record preceding it in the chain.
   */
  readonly recordAncestors: readonly Record[];
  readonly modulePath: string;
}

export type MutableRecordLocation = RecordLocation<true>;

/** The set of names from one module imported to another module. */
export type ImportedNames =
  | { kind: "all"; alias: string }
  | { kind: "some"; names: ReadonlySet<string> };

export interface Module<Mutable extends boolean = boolean> {
  readonly kind: "module";
  readonly path: string;
  readonly nameToDeclaration: { [n: string]: ModuleLevelDeclaration<Mutable> };
  readonly declarations: ReadonlyArray<ModuleLevelDeclaration<Mutable>>;

  /**
   * Maps the path (to another module) to the corresponding import declarations in
   * this module.
   */
  readonly pathToImportedNames: { [path: string]: ImportedNames };

  /**
   * All the record declared in the module, at the top-level or not.
   * Depth-first: "Foo.Bar" will appear before "Foo".
   */
  readonly records: //
    Mutable extends true //
      ? MutableRecordLocation[]
      : readonly RecordLocation[];

  readonly procedures: ReadonlyArray<Procedure<Mutable>>;

  readonly constants: ReadonlyArray<Constant<Mutable>>;
}

/** Can be assigned to a `Module`. */
export type MutableModule = Module<true>;
