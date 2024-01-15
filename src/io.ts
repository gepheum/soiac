import * as fs from "fs";

export interface FileReader {
  readTextFile(path: string): string | undefined;
}

export interface FileWriter {
  writeTextFile(path: string, contents: string): void;
}

class RealFileSystem implements FileReader, FileWriter {
  readTextFile(path: string): string | undefined {
    try {
      return fs.readFileSync(path, "utf-8");
    } catch (error) {
      if (
        typeof error === "object" && error && "code" in error &&
        error.code === "ENOENT"
      ) {
        return undefined;
      }
      throw error;
    }
  }

  writeTextFile(path: string, contents: string): void {
    fs.writeFileSync(path, contents, "utf-8");
  }
}

export const REAL_FILE_SYSTEM = new RealFileSystem();
