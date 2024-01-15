// TODO: clear directory?
// TODO: print the files that were re-generated each time...
// TODO: test that this works if the current directory is not the right one?
// TODO: start a cycle when the loop starts...
// TODO: make it possible to specify a glob in soia.yml to specify the soia file patterns for each language? I dunno, maybe.
// TODO: think about importing node modules....
// TODO: https://medium.com/@muhammadtaifkhan/watch-file-system-using-nodejs-7d4f9f16ce02#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxNDEzY2Y0ZmEwY2I5MmEzYzNmNWEwNTQ1MDkxMzJjNDc2NjA5MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDkzOTM3ODE1NzEyOTA1MzQyODgiLCJlbWFpbCI6ImNsZW1lbnRidGNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTcwNDEzMjU0NywibmFtZSI6IkNsw6ltZW50IFJvdXgiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSWdRYXQ3S21jazYzRkNQOEY2b0xzaEtFREhBSWFfZDBhQTV3OGpQbTg1NmFKTD1zOTYtYyIsImdpdmVuX25hbWUiOiJDbMOpbWVudCIsImZhbWlseV9uYW1lIjoiUm91eCIsImxvY2FsZSI6ImZyIiwiaWF0IjoxNzA0MTMyODQ3LCJleHAiOjE3MDQxMzY0NDcsImp0aSI6ImY1YzAwOGMyZTk2Njk5ZTk3Y2IzNWI2NjFhMzBkYzc2ZDFjNDI4MDQifQ.GC62G6liVo-7ZPlpHSBA9O_upeWfIfJq8Qww9nsv9okDz6ZcF39TBTfwFtQ7rJy6qUcecP9GlkdT0-Hg_UTbAvgB_8a5wfIpAmNQ0XYZaDGp1ZBJhTcBXD2nLT2tQZxPmLN4vn8mKex_4RmS5_yVFXaYcuxck7CuqCkYJ50nvAxBKcQAPzcTU-0sg2w63U9pHZhoiiSjLbkeAbB6KwQ8yv21HPBcByP2FfaGDYOU8vu1HesqJJKJNLTW6kCWHeCAXlOK8w7nP3rqCm8L-eLiuB7sgwz-0KL0tiJ6nLNNp8hP3J3jvqlyiin3PPjDEaiZtafw-lY-mV_cyYn8mSTe_Q
// TODO: clear the screen each time
// TODO: https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search

import * as process from "process";
import type { Error } from "./module.js";
import { ModuleSet } from "./module_set.js";
import { TypescriptCodeGenerator } from "./languages/typescript.js";
import { REAL_FILE_SYSTEM } from "./io.js";
import * as paths from "path";
import { z } from "zod";
import * as yaml from "yaml";
import { CodeGenerator } from "./code_generator.js";
import Watcher from "watcher";
import * as fs from "fs/promises";
import { glob } from 'glob';
import { parseArgs } from "node:util";

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
      const path = paths.join(process.cwd(), "generators", id);
      try {
        modulePath = await fs.readFile(path, "utf-8");
      } catch (error) {
        // TODO: throw specific error if file not found !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  const soiaFiles = await glob(paths.join(root, "**/*.soia"), { stat: true, withFileTypes: true });
  for await (const soiaFile of soiaFiles) {
    if (!soiaFile.isFile) {
      continue;
    }
    const relativePath =
      paths.relative(root, soiaFile.fullpath()).replace(/\\/g, "/");
    modules.parseAndResolve(relativePath);
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
    await this.generate();
    const watcher = new Watcher(this.root, {
      renameDetection: true,
      recursive: true,
      persistent: true,
    });
    watcher.on("all", (_, targetPath, targetPathNext) => {
      if (
        targetPath.endsWith(".soia") ||
        (targetPathNext && targetPathNext.endsWith(".soia"))
      ) {
        this.triggerGeneration();
      }
    });
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

  async generate(): Promise<void> {
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
    await fs.mkdir(paths.join(this.root, "soiagen"), { recursive: true });

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
      const fsPath = paths.join(this.root, "soiagen", p);
      const newFile = pathToFile.get(p);
      if (newFile === undefined) {
        // TODO: check if I need to swallow error
        return fs.unlink(fsPath);
      }
      const oldFile = lastWriteBatch.pathToFile.get(p);
      if (oldFile?.code === newFile.code) {
        const mtime = (await fs.stat(fsPath)).mtime;
        if (
          mtime !== null &&
          mtime.getDate() <= lastWriteBatch.writeTime.getDate()
        ) {
          return;
        }
      }
      await fs.mkdir(paths.dirname(fsPath), { recursive: true });
      await fs.writeFile(fsPath, newFile.code, "utf-8");
    }));

    this.lastWriteBatch = {
      pathToFile: pathToFile,
      writeTime: new Date(),
    };
  }

  private timeoutId?: NodeJS.Timeout;
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
  const {
    values: { root, watch },
  } = parseArgs({ options: {
    root: {
      type: 'string',
      short: 'r',
      default: '.',
    },
    watch: {
      type: 'boolean',
      short: 'w',
    },
  } });

  const soiaConfigPath = paths.join(root!, "soia.yml");
  let soiaConfigContents: string;
  try {
    soiaConfigContents = await fs.readFile(soiaConfigPath, "utf-8");
  } catch (error) {
    // TODO: throw specific error if file not found !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    throw error;
  }

  // TODO: maybe use safeParse
  const soiaConfig = SoiaConfig.parse(yaml.parse(soiaConfigContents));

  const generatorBundles: GeneratorBundle[] = await Promise.all(
    soiaConfig.generators.map(makeGeneratorBundle),
  );
  // TODO: ensure consistent order

  const watchModeMainLoop = new WatchModeMainLoop(root!, generatorBundles);
  if (watch) {
    await watchModeMainLoop.start();
  } else {
    await watchModeMainLoop.generate();
  }
}

main();
