// GENERATED CODE, DO NOT EDIT

import * as $ from "soia";

// -----------------------------------------------------------------------------
// struct User
// -----------------------------------------------------------------------------

// Exported as 'User.Builder'
class User_Mutable extends $._MutableBase {
  constructor(
    copyable: User.Copyable = User.DEFAULT,
  ) {
    super();
    initUser(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  userId!: bigint;

  toFrozen(): User {
    return User.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: User.Copyable | undefined;
}

export class User extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<User.Copyable, Accept>,
  ): User {
    if (copyable instanceof User) {
      return copyable;
    }
    return new User(copyable);
  }

  private constructor(copyable: User.Copyable) {
    super();
    initUser(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly userId!: bigint;

  static readonly DEFAULT = new User({});

  declare toFrozen: () => this;
  declare toMutable: () => User.Mutable;

  static readonly Mutable = User_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: User.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initUser(
  target: Record<string, unknown>,
  copyable: User.Copyable,
): void {
  target.userId = copyable.userId || BigInt(0);
}

export declare namespace User {
  export interface Copyable {
    readonly userId?: bigint;
  }

  export type Mutable = User_Mutable;
  export type OrMutable = User | Mutable;
}

// -----------------------------------------------------------------------------
// struct UserProfile
// -----------------------------------------------------------------------------

// Exported as 'UserProfile.Builder'
class UserProfile_Mutable extends $._MutableBase {
  constructor(
    copyable: UserProfile.Copyable = UserProfile.DEFAULT,
  ) {
    super();
    initUserProfile(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  user!: User.OrMutable;

  get mutableUser(): User.Mutable {
    const v = this.user;
    return v instanceof User.Mutable ? v : (this.user = v.toMutable());
  }

  toFrozen(): UserProfile {
    return UserProfile.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: UserProfile.Copyable | undefined;
}

export class UserProfile extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<UserProfile.Copyable, Accept>,
  ): UserProfile {
    if (copyable instanceof UserProfile) {
      return copyable;
    }
    return new UserProfile(copyable);
  }

  private constructor(copyable: UserProfile.Copyable) {
    super();
    initUserProfile(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly user!: User;

  static readonly DEFAULT = new UserProfile({});

  declare toFrozen: () => this;
  declare toMutable: () => UserProfile.Mutable;

  static readonly Mutable = UserProfile_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: UserProfile.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initUserProfile(
  target: Record<string, unknown>,
  copyable: UserProfile.Copyable,
): void {
  target.user = User.create(copyable.user || User.DEFAULT);
}

export declare namespace UserProfile {
  export interface Copyable {
    readonly user?: User.Copyable;
  }

  export type Mutable = UserProfile_Mutable;
  export type OrMutable = UserProfile | Mutable;
}

// -----------------------------------------------------------------------------
// struct UserProfiles
// -----------------------------------------------------------------------------

// Exported as 'UserProfiles.Builder'
class UserProfiles_Mutable extends $._MutableBase {
  constructor(
    copyable: UserProfiles.Copyable = UserProfiles.DEFAULT,
  ) {
    super();
    initUserProfiles(this as Record<string, unknown>, copyable);
    Object.seal(this);
  }

  profiles!: ReadonlyArray<UserProfile.OrMutable>;

  get mutableProfiles(): Array<UserProfile.OrMutable> {
    return this.profiles = $._toMutableArray(this.profiles);
  }

  toFrozen(): UserProfiles {
    return UserProfiles.create(this);
  }

  declare toMutable: () => this;

  declare readonly [$._COPYABLE]: UserProfiles.Copyable | undefined;
}

export class UserProfiles extends $._FrozenBase {
  static create<Accept extends "partial" | "whole" = "partial">(
    copyable: $.WholeOrPartial<UserProfiles.Copyable, Accept>,
  ): UserProfiles {
    if (copyable instanceof UserProfiles) {
      return copyable;
    }
    return new UserProfiles(copyable);
  }

  private constructor(copyable: UserProfiles.Copyable) {
    super();
    initUserProfiles(this as Record<string, unknown>, copyable);
    Object.freeze(this);
  }

  readonly profiles!: ReadonlyArray<UserProfile>;
  private __maps: {
    profiles?: Map<string, UserProfile>;
  } = {};

  get profilesMap(): ReadonlyMap<string, UserProfile> {
    return this.__maps.profiles || (
      this.__maps.profiles = new Map(
        this.profiles.map((v) => [v.user.userId.toString(), v]),
      )
    );
  }

  static readonly DEFAULT = new UserProfiles({});

  declare toFrozen: () => this;
  declare toMutable: () => UserProfiles.Mutable;

  static readonly Mutable = UserProfiles_Mutable;

  declare private FROZEN: undefined;
  declare readonly [$._COPYABLE]: UserProfiles.Copyable | undefined;

  static readonly SERIALIZER = $._newStructSerializer(this.DEFAULT);
}

function initUserProfiles(
  target: Record<string, unknown>,
  copyable: UserProfiles.Copyable,
): void {
  target.profiles = $._toFrozenArray(
    copyable.profiles || [],
    (e) => UserProfile.create(e),
  );
}

export declare namespace UserProfiles {
  export interface Copyable {
    readonly profiles?: ReadonlyArray<UserProfile.Copyable>;
  }

  export type Mutable = UserProfiles_Mutable;
  export type OrMutable = UserProfiles | Mutable;
}

// -----------------------------------------------------------------------------
// Procedures
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Initialize the serializers
// -----------------------------------------------------------------------------

const _MODULE_PATH = "user.soia";

$._initStructSerializer(
  User.SERIALIZER,
  "User",
  "User",
  _MODULE_PATH,
  undefined,
  [
    ["user_id", "userId", 0, $.primitiveSerializer("int64")],
  ],
  [],
);

$._initStructSerializer(
  UserProfile.SERIALIZER,
  "UserProfile",
  "UserProfile",
  _MODULE_PATH,
  undefined,
  [
    ["user", "user", 0, User.SERIALIZER],
  ],
  [],
);

$._initStructSerializer(
  UserProfiles.SERIALIZER,
  "UserProfiles",
  "UserProfiles",
  _MODULE_PATH,
  undefined,
  [
    ["profiles", "profiles", 0, $.arraySerializer(UserProfile.SERIALIZER)],
  ],
  [],
);
