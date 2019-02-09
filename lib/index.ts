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
