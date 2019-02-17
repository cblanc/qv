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

interface Note {
  readonly notebook: Notebook;
  readonly uuid: string;
  readonly title: string;
  readonly updated_at: number;
  readonly created_at: number;
  readonly tags: string[];
  readonly notePath: string;
}

/**
 * Retrieves notes for a given notebook
 */
export const getNotes = async (notebook: Notebook): Promise<Note[]> => {
  const { notebookPath } = notebook;
  const noteDirectories = await getDirectories(notebookPath);
  const promises = noteDirectories.map(async notePath => {
    const rawData = await getFile(path.resolve(notePath, "meta.json"));
    const data = JSON.parse(rawData);
    return { notebook, notePath, ...data };
  });
  return Promise.all(promises);
};

type CellType = "text" | "markdown" | "code" | "latex" | "diagram";

interface Cell {
  readonly type: CellType;
  readonly data: string;
}

export interface Content {
  readonly cells: Cell[];
  readonly title: string;
  readonly contentPath: string;
}

export const getContent = async (note: Note): Promise<Content> => {
  const contentPath = path.resolve(note.notePath, "content.json");
  const rawData = await getFile(contentPath);
  const data = JSON.parse(rawData);
  return { contentPath, ...data };
};

export const SEPARATOR = `>>>>>`;

const cellToString = (cell: Cell): string => {
  const { type, data } = cell;
  return `${SEPARATOR}${type}
${data}`;
};

/**
 * contentToString
 *
 * Converts a content object to string
 */
export const contentToString = (content: Content): string => {
  return content.cells.map(cellToString).join("\n");
};

const contentRegex = /\n?>>>>>[^\n]*\n/gi;

/**
 * Extracts type information headers from raw cell data
 */
const extractTypes = (cellsData: string): string[] => {
  return cellsData.match(contentRegex) || [];
};

/**
 * Parses a raw type header - returns indication of cell type
 */
const parseType = (typeField: string): CellType => {
  const sanitized = typeField.replace(SEPARATOR, "").trim();
  if (sanitized.match(/^code/i)) return "code";
  if (sanitized.match(/^markdown/i)) return "markdown";
  if (sanitized.match(/^latex/i)) return "latex";
  if (sanitized.match(/^diagram/i)) return "diagram";
  return "text";
};

/**
 * Extracts content data from raw cell data.
 *
 * First result is eliminated, this would be the title
 */
const extractData = (cellsData: string): string[] => {
  const result = cellsData.split(contentRegex);
  result.shift();
  return result;
};

/**
 * parseContent
 *
 * Parses raw data into a content object
 */
export const parseContent = (cellsData: string): Cell[] => {
  const typeFields = extractTypes(cellsData).map(parseType);
  const dataFields = extractData(cellsData);
  return typeFields.map((type, i) => {
    const data = dataFields[i] === undefined ? "" : dataFields[i];
    return { data, type };
  });
};

/**
 * writeContent
 *
 * Writes content for a note to disk
 */
// const writeContent = (content: Content, note: Note): Promise<content> => {};
