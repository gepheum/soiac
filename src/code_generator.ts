// TODO: add version

import type { ModuleSet } from "./module_set.ts";
import type { z } from "zod";

export interface CodeGenerator<Config = unknown> {
  readonly id: string;
  readonly configType: z.ZodType<Config>;
  generateCode(modules: ModuleSet, config: Config): CodeGenerator.Output;
}

export declare namespace CodeGenerator {
  export interface Output {
    files: readonly OutputFile[];
  }

  export interface OutputFile {
    path: string;
    code: string;
  }
}
