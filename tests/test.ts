import { join } from "path";
import { use } from "chai";
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);
import { assert } from "chai";

import {
  getNotebook,
  format,
  deleteFile,
  newFile,
  Content,
  contentToString,
  parseContent,
  getContent,
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

describe("loadContent", () => {
  it("Loads note content", async () => {
    const name = "typescript";
    const notebook = await findNotebook({ libraryPath, name });
    if (notebook === null) throw Error("Notebook cannot be null");
    const [note] = await getNotes(notebook);
    const content = await getContent(note);
    assert.equal(content.title, "Notes");
    assert.isDefined(content.contentPath);
    const cell = content.cells[0];
    assert.equal(cell.type, "text");
  });
});

describe("Content manipulation", () => {
  const data = `This is a test

This is a test 2

This is a test 3
`;

  const content: Content = {
    title: "Test",
    contentPath: "foo",
    cells: [{ data, type: "text" }, { data, type: "markdown" }],
  };

  const expected = `>>>>>text
This is a test

This is a test 2

This is a test 3

>>>>>markdown
This is a test

This is a test 2

This is a test 3
`;
  describe("contentToString", () => {
    it("writes content to string", () => {
      assert.equal(contentToString(content), expected);
    });
  });
  describe("parseContent", () => {
    assert.deepEqual(parseContent(expected), content.cells);
  });
});

describe("newFile", () => {
  const filePath = join(__dirname, "newFile.txt");
  after(async () => await deleteFile(filePath));

  it("writes object data to file", async () => {
    const data = { foo: "bar", baz: ["quux"] };
    await newFile(filePath, data);
    const readData = await getFile(filePath);
    assert.equal(readData, format(data));
  });
});

describe("deleteFile", () => {
  const filePath = join(__dirname, "deleteFile.txt");

  before(async () => await newFile(filePath, {}));

  it("deletes file", async () => {
    const data = await getFile(filePath);
    assert.isString(data);
    await deleteFile(filePath);
    try {
      await getFile(filePath);
    } catch (error) {
      assert.equal(error.code, "ENOENT");
      return;
    }
    throw new Error("File should be deleted");
  });

  it("throws error if file doesn't exist", async () => {
    try {
      await deleteFile("foo");
    } catch (error) {
      assert.equal(error.code, "ENOENT");
      return;
    }
    throw new Error("Deleting a file which doesn't exist should raise");
  });
});
