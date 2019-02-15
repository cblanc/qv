import * as path from "path";

import { readdir, readFile } from "fs";

// Returns a list of directories at dirPath
export const getDirectories = (dirPath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    readdir(dirPath, { withFileTypes: true }, (error, result) => {
      if (error) return reject(error);
      return resolve(
        result
          .filter(entry => entry.isDirectory())
          .map(entry => path.resolve(dirPath, entry.name))
      );
    });
  });
};

// Reads back raw data from file
export const getFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const encoding = "utf8";
    readFile(filePath, { encoding }, (error, data) => {
      if (error) return reject(error);
      return resolve(data);
    });
  });
};

/**
 * Notebook
 *
 * Represents Quiver notebook
 */
export interface Notebook {
  // Absolute path to notebook
  readonly notebookPath: string;

  // Noteobok name
  readonly name: string;

  // UUID
  readonly uuid: string;
}

interface FindOptions {
  readonly libraryPath: string;
  readonly name: string;
}
/**
 * findNotebook
 *
 * Retrieves a notebook by name otherwise returns null
 */
export const findNotebook = (
  options: FindOptions
): Promise<Notebook | null> => {
  return getNotebooks(options.libraryPath).then(notebooks => {
    return notebooks.reduce<Notebook | null>((prev, notebook) => {
      if (notebook.name === options.name) return notebook;
      return prev;
    }, null);
  });
};

/**
 * getNotebook
 *
 * Retrieves notbook data by path
 */
export const getNotebook = (notebookPath: string): Promise<Notebook> => {
  const filePath = path.resolve(notebookPath, "meta.json");
  return new Promise(async (resolve, reject) => {
    try {
      const data = await getFile(filePath);
      const { name, uuid } = JSON.parse(data);
      return resolve({ notebookPath, name, uuid });
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * getNotebooks
 *
 * Retrieves notebooks from a given library path
 */
export const getNotebooks = async (
  libraryPath: string
): Promise<Notebook[]> => {
  const notebookPaths = await getDirectories(libraryPath);
  return Promise.all(notebookPaths.map(getNotebook));
};
