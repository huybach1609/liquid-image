import { expect, it, describe } from "bun:test";
import { getUniqueFilename, resolvePathConflict } from "../conflictResolver";

describe("conflictResolver", () => {
  describe("getUniqueFilename", () => {
    it("should append _1 if targetPath is already occupied", () => {
      const occupied = new Set(["/path/to/image.png"]);
      const result = getUniqueFilename("/path/to/image.png", occupied);
      expect(result).toBe("/path/to/image_1.png");
    });

    it("should increment counter until an unoccupied path is found", () => {
      const occupied = new Set([
        "/path/to/image.png",
        "/path/to/image_1.png",
        "/path/to/image_2.png"
      ]);
      const result = getUniqueFilename("/path/to/image.png", occupied);
      expect(result).toBe("/path/to/image_3.png");
    });

    it("should handle files with multiple dots and without extension", () => {
      const occupied = new Set(["/path/to/archive.tar.gz"]);
      const result = getUniqueFilename("/path/to/archive.tar.gz", occupied);
      expect(result).toBe("/path/to/archive.tar_1.gz");

      const occupiedNoExt = new Set(["/path/to/README"]);
      const resultNoExt = getUniqueFilename("/path/to/README", occupiedNoExt);
      expect(resultNoExt).toBe("/path/to/README_1");
    });
  });

  describe("resolvePathConflict", () => {
    it("should return targetPath with skip: false when policy is overwrite", async () => {
      const result = await resolvePathConflict("/any/path.png", "overwrite");
      expect(result.path).toBe("/any/path.png");
      expect(result.skip).toBe(false);
    });
  });
});
