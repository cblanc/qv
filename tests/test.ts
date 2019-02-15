import { join } from "path";
import { use } from "chai";
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);
import { assert } from "chai";

import {
  getNotebook,
  getDirectories,
  getFile,
  getNotebooks,
  getNotes,
  findNotebook,
} from "../lib/index";

// Path to default quiver directory
const libraryPath = join(__dirname, "./Quiver.qvlibrary");

const EXPECTED_DIRECTORIES = 3;

describe("getNotebooks", () => {
  it("retrieves a list of notebooks given a library location", async () => {
    const notebooks = await getNotebooks(libraryPath);
    assert.equal(notebooks.length, EXPECTED_DIRECTORIES);
  });
});

describe("getDirectories", () => {
  it("returns a list of directory paths", async () => {
    const directories = await getDirectories(libraryPath);
    assert.equal(directories.length, EXPECTED_DIRECTORIES);
    directories.forEach(name => assert.match(name, RegExp(__dirname)));
  });

  it("returns an error if invalid path", () => {
    assert.isRejected(getDirectories("foo"));
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
    const [notebookPath] = await getDirectories(libraryPath);
    const notebook = await getNotebook(notebookPath);
    assert.include(notebookPath, notebook.uuid);
  });

  it("returns an error if invalid notebook path", async () => {
    assert.isRejected(getNotebook("foo"));
  });
});

describe("getNotebooks", () => {
  it("returns a list of all notebooks given a library path", async () => {
    const notebooks = await getNotebooks(libraryPath);
    assert.isTrue(notebooks.length > 0);
  });
});

describe("findNotebook", () => {
  it("returns a notebook that matches a name", async () => {
    const name = "typescript";
    const notebook = await findNotebook({ libraryPath, name });
    if (notebook === null) throw new Error("Notebook should not be null");
    assert.equal(notebook.name, name);
  });

  it("returns null if no matching notebook found", async () => {
    const name = "foo";
    const notebook = await findNotebook({ libraryPath, name });
    assert.isNull(notebook);
  });
});

describe("getNotes", () => {
  it("returns a list of notes given a notebook", async () => {
    const name = "typescript";
    const notebook = await findNotebook({ libraryPath, name });
    if (notebook === null) throw Error("Notebook cannot be null");
    const [note] = await getNotes(notebook);
    assert.isNumber(note.created_at);
    assert.isNumber(note.updated_at);
    assert.deepEqual(note.tags, []);
    assert.deepEqual(note.notebook, notebook);
    assert.equal(note.title, "Notes");
  });
});
