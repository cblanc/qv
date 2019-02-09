import { join } from "path";
import { assert } from "chai";

import {
  getNotebook,
  getDirectories,
  getFile,
  getNotebooks,
} from "../lib/index";

// Path to default quiver directory
const quiverPath = join(__dirname, "./Quiver.qvlibrary");

const throwUnreachable = (msg?: string) => {
  throw new Error(`This code should not be reached. ${msg ? msg : ""}`);
};

describe("getNotebooks", () => {
  it("retrieves a list of notebooks given a library location", () => {});
});

describe("getDirectories", () => {
  it("returns a list of directory paths", async () => {
    const directories = await getDirectories(quiverPath);
    const expectedDirectories = 3;
    assert.equal(directories.length, expectedDirectories);
    directories.forEach(name => assert.match(name, RegExp(__dirname)));
  });

  it("returns an error if invalid path", async () => {
    try {
      await getDirectories("foo");
    } catch (e) {
      assert.equal(e.path, "foo");
      assert.equal(e.code, "ENOENT");
      return;
    }
    throwUnreachable();
  });
});

describe("getFile", () => {
  it("loads a file", async () => {
    const data = await getFile(__filename);
    assert.include(data, "await getFile(__filename);");
  });
});

describe("getNotebook", () => {
  it("returns a notebook given a path", async () => {
    const [notebookPath] = await getDirectories(quiverPath);
    const notebook = await getNotebook(notebookPath);
    assert.include(notebookPath, notebook.uuid);
  });

  it("returns an error if invalid notebook path", async () => {
    try {
      await getNotebook("foo");
    } catch (error) {
      process.stdout.write(error);
      return;
    }
    throwUnreachable();
  });
});

describe("getNotebooks", () => {
  it("returns a list of all notebooks given a library path", async () => {
    const notebooks = await getNotebooks(quiverPath);
    assert.isTrue(notebooks.length > 0);
  });
});
