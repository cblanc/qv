import { join } from "path";
import { assert } from "chai";

import { getDirectories, getFile } from "../lib/index";

// Path to default quiver directory
const quiverPath = join(__dirname, "./Quiver.qvlibrary");

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
    throw new Error("This should not be reached");
  });
});

describe("getFile", () => {
  it("loads a file", async () => {
    const data = await getFile(__filename);
    assert.include(data, "await getFile(__filename);");
  });
});
