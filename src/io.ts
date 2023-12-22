export interface FileReader {
  readTextFile(path: string): string | undefined;
}

export interface FileWriter {
  writeTextFile(path: string, contents: string): void;
}

class RealFileSystem implements FileReader, FileWriter {
  readTextFile(path: string): string | undefined {
    try {
      return Deno.readTextFileSync(path);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return undefined;
      }
      throw error;
    }
  }

  writeTextFile(path: string, contents: string): void {
    Deno.writeTextFileSync(path, contents);
  }
}

export const REAL_FILE_SYSTEM = new RealFileSystem();
