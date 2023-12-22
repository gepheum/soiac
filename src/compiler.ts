// TODO: remove
//   deno run --allow-read --allow-write src/compiler.ts integration/typescript
// TODO: print the files that were re-generated each time...
// TODO: error on unrecognized flags
// TODO: test that this works if the current directory is not the right one?
// TODO: start a cycle when the loop starts...
// TODO: make it possible to specify a glob in soia.yml to specify the soia file patterns for each language? I dunno, maybe.

import * as flags from "flags";
import { Error } from "./module.ts";
import { ModuleSet } from "./module_set.ts";
import { TypescriptCodeGenerator } from "./languages/typescript.ts";
import { REAL_FILE_SYSTEM } from "./io.ts";
import * as paths from "path";
import { z } from "zod";
import * as yaml from "yaml";
import { CodeGenerator } from "./code_generator.ts";
import { walk } from "walk";
import { _COPYABLE } from "https://cdn.jsdelivr.net/npm/soia@^1.0.7/src/soia.ts";

const BUILTIN_CODE_GENERATORS: readonly CodeGenerator[] = [
  new TypescriptCodeGenerator(),
];

const ID_TO_BUILTIN_CODE_GENERATOR: ReadonlyMap<string, CodeGenerator> =
  new Map(BUILTIN_CODE_GENERATORS.map((g) => [g.id, g]));

const GeneratorConfig = z.object({
  id: z.string(),
  config: z.any(),
});

type GeneratorConfigType = z.infer<typeof GeneratorConfig>;

const SoiaConfig = z.object({
  generators: z.array(GeneratorConfig),
});

interface GeneratorBundle {
  generator: CodeGenerator;
  config: GeneratorConfigType;
}

async function makeGeneratorBundle(
  config: GeneratorConfigType,
): Promise<GeneratorBundle> {
  const { id } = config;
  let generator = ID_TO_BUILTIN_CODE_GENERATOR.get(id);
  if (!generator) {
    let modulePath: string;
    if (id.includes("//")) {
      modulePath = id;
    } else {
      if (paths.dirname(id) !== id) {
        // TODO: error
        throw "FOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
      }
      const path = paths.join(Deno.execPath(), "generators", id);
      try {
        modulePath = Deno.readTextFileSync(path);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          // TODO: error
          throw "FOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
        }
        throw error;
      }
      if (!modulePath.includes("//")) {
        // TODO: error
        throw "FOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
      }
    }
    const mod = await import(modulePath);
    generator = mod.GENERATOR;
    if (typeof generator !== "object") {
      // TODO: error
      throw "FOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
    }
  }
  return {
    generator: generator,
    config: config,
  };
}

async function collectModules(root: string): Promise<ModuleSet> {
  const modules = new ModuleSet(REAL_FILE_SYSTEM, root);
  for await (const walkEntry of walk(root)) {
    const { path } = walkEntry;
    // TODO: backslash to slash...
    if (walkEntry.isFile && path.endsWith(".soia")) {
      const relativePath = paths.relative(root, path);
      modules.parseAndResolve(relativePath);
    }
  }
  return modules;
}

interface WriteBatch {
  readonly pathToFile: ReadonlyMap<string, CodeGenerator.OutputFile>;
  readonly writeTime: Date;
}

class WatchModeMainLoop {
  constructor(
    private readonly root: string,
    private readonly generatorBundles: readonly GeneratorBundle[],
  ) {}

  async start() {
    this.generate();
    const watcher = Deno.watchFs(this.root);
    for await (const event of watcher) {
      if (event.paths.some((p) => p.endsWith(".soia"))) {
        this.triggerGeneration();
      }
    }
  }

  private triggerGeneration(): void {
    if (this.generating) {
      this.mustRegenerate = true;
      return;
    }
    if (this.timeoutId !== undefined) {
      globalThis.clearTimeout(this.timeoutId);
    }
    const delayMillis = 200;
    this.timeoutId = globalThis.setTimeout(() => this.generate(), delayMillis);
  }

  private async generate(): Promise<void> {
    this.generating = true;
    this.timeoutId = undefined;
    this.mustRegenerate = false;
    try {
      const moduleSet = await collectModules(this.root);
      const { errors } = moduleSet;
      if (errors.length) {
        renderErrors(errors);
      } else {
        await this.doGenerate(moduleSet);
      }
    } finally {
      this.generating = false;
      if (this.mustRegenerate) {
        this.triggerGeneration();
      }
    }
  }

  private async doGenerate(moduleSet: ModuleSet): Promise<void> {
    // TODO: swallow error if some I/O error is thrown?

    const pathToFile = new Map<string, CodeGenerator.OutputFile>();
    for (const bundle of this.generatorBundles) {
      const files =
        bundle.generator.generateCode(moduleSet, bundle.config).files;
      for (const file of files) {
        const { path } = file;
        if (pathToFile.has(path)) {
          // TODO: error! Multiple generators output the same file...
        }
        pathToFile.set(path, file);
      }
    }

    const { lastWriteBatch } = this;
    const allPaths = //
      [...lastWriteBatch.pathToFile.keys()].concat([...pathToFile.keys()]);
    await Promise.all(allPaths.map(async (p) => {
      const newFile = pathToFile.get(p);
      if (newFile === undefined) {
        return Deno.remove(p);
      }
      const oldFile = lastWriteBatch.pathToFile.get(p);
      if (oldFile?.code === newFile.code) {
        const mtime = (await Deno.stat(p)).mtime;
        if (
          mtime !== null &&
          mtime.getDate() <= lastWriteBatch.writeTime.getDate()
        ) {
          return;
        }
      }
      const writePath = paths.join(this.root, p);
      await Deno.writeTextFile(writePath, newFile.code);
    }));

    this.lastWriteBatch = {
      pathToFile: pathToFile,
      writeTime: new Date(),
    };
  }

  private timeoutId?: number;
  private generating = false;
  private mustRegenerate = false;
  private lastWriteBatch: WriteBatch = {
    pathToFile: new Map(),
    writeTime: new Date(0),
  };
}

function renderErrors(errors: readonly Error[]): void {
  // TODO: change !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  console.log(JSON.stringify(errors));
}

async function main(): Promise<void> {
  const parsedFlags = flags.parse(Deno.args, {});

  let root: string;
  {
    const args = parsedFlags["_"];
    if (args.length <= 0) {
      root = ".";
    } else if (args.length === 1) {
      root = String(args[0]);
    } else {
      // TODO: ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      return;
    }
  }

  const soiaConfigPath = paths.join(root, "soia.yml");
  let soiaConfigContents: string;
  try {
    soiaConfigContents = Deno.readTextFileSync(soiaConfigPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // TODO: error
    }
    throw error;
  }

  // TODO: maybe use safeParse
  const soiaConfig = SoiaConfig.parse(yaml.parse(soiaConfigContents));

  const generatorBundles: GeneratorBundle[] = await Promise.all(
    soiaConfig.generators.map(makeGeneratorBundle),
  );
  // TODO: ensure consistent order

  (await new WatchModeMainLoop(root, generatorBundles)).start();
}

main();
