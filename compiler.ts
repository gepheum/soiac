// TODO: remove
//   deno run --allow-read --allow-write soia/compiler/compiler.ts
// TODO: error on unrecognized flags

import { parse } from "https://deno.land/std@0.198.0/flags/mod.ts";
import * as posix from "https://deno.land/std@0.198.0/path/posix.ts";
import { ModuleSet } from "./module_set.ts";
import { TypescriptCodeGenerator } from "./languages/typescript.ts";
import { REAL_FILE_SYSTEM } from "./io.ts";
import * as mod from "https://deno.land/std@0.198.0/path/mod.ts";

interface InputPath {
  path: string;
}

function collectInputPaths(directory: string): InputPath[] {
  const result: InputPath[] = [];
  for (const dirEntry of Deno.readDirSync(directory)) {
    const path = posix.join(directory, dirEntry.name);
    if (dirEntry.isDirectory) {
      result.push(...collectInputPaths(path));
    } else if (dirEntry.isFile && dirEntry.name.endsWith(".soia")) {
      // TODO: change extension above
      result.push({ path: path });
    }
  }
  return result;
}

function main() {
  // From https://examples.deno.land/command-line-arguments
  const flagsParseOptions = {
    string: ["in", "out"],
    // TODO: get this from the code generator
    boolean: ["ts"],
    default: { "in": ".", "out": "." },
  };
  const flags = parse(Deno.args, flagsParseOptions);

  const inputPaths = collectInputPaths(posix.normalize(flags.in));
  console.log(inputPaths);

  // TODO: change
  const root = Deno.realPathSync(".");

  const modules = new ModuleSet(REAL_FILE_SYSTEM, root);
  for (const modulePath of inputPaths) {
    const errors = modules.parseAndResolve(modulePath.path).errors;
    if (errors.length !== 0) {
      // TODO: change
      throw errors;
    }
  }

  // TODO: make this work with any code generator
  const codeGenerator = new TypescriptCodeGenerator();
  const outputFiles = codeGenerator.generateCode(modules);

  // TODO: change
  for (const outputFile of outputFiles) {
    REAL_FILE_SYSTEM.writeTextFile(
      mod.join(root, outputFile.path),
      outputFile.code,
    );
    console.log(`Wrote ${outputFile.path}`);
  }
}

main();
