import { expect, it, describe } from "bun:test";
import { 
  getFileNameFromPath, 
  getFileNameWithoutExtension, 
  getFileExtension, 
  getDirectoryPath, 
  normalizeOutputDir, 
  normalizeOutputName, 
  normalizeOutputExt 
} from "../pathUtils";

describe("pathUtils", () => {
  describe("getFileNameFromPath", () => {
    it("should handle linux paths", () => {
      expect(getFileNameFromPath("/home/user/photo.jpg")).toBe("photo.jpg");
    });
    it("should handle windows paths", () => {
      expect(getFileNameFromPath("C:\\Users\\user\\photo.jpg")).toBe("photo.jpg");
    });
    it("should handle raw filenames", () => {
      expect(getFileNameFromPath("photo.jpg")).toBe("photo.jpg");
    });
  });

  describe("getFileNameWithoutExtension", () => {
    it("should remove extension", () => {
      expect(getFileNameWithoutExtension("/home/user/photo.jpg")).toBe("photo");
    });
    it("should handle multiple dots", () => {
      expect(getFileNameWithoutExtension("archive.tar.gz")).toBe("archive.tar");
    });
    it("should handle no extension", () => {
      expect(getFileNameWithoutExtension("README")).toBe("README");
    });
    it("should handle hidden files", () => {
      expect(getFileNameWithoutExtension(".gitignore")).toBe(".gitignore");
    });
  });

  describe("getFileExtension", () => {
    it("should return extension in lowercase", () => {
      expect(getFileExtension("PHOTO.JPG")).toBe("jpg");
    });
    it("should return empty string if no extension", () => {
      expect(getFileExtension("README")).toBe("");
    });
  });

  describe("getDirectoryPath", () => {
    it("should return directory part", () => {
      expect(getDirectoryPath("/home/user/photo.jpg")).toBe("/home/user");
    });
    it("should handle windows paths", () => {
      expect(getDirectoryPath("C:\\Users\\user\\photo.jpg")).toBe("C:/Users/user");
    });
    it("should return . if no directory", () => {
      expect(getDirectoryPath("photo.jpg")).toBe(".");
    });
  });

  describe("normalizeOutputDir", () => {
    it("should remove trailing slashes", () => {
      expect(normalizeOutputDir("./output/")).toBe("./output");
      expect(normalizeOutputDir("./output///")).toBe("./output");
    });
    it("should use fallback for invalid input", () => {
      expect(normalizeOutputDir("")).toBe("./output");
      expect(normalizeOutputDir(null)).toBe("./output");
    });
  });

  describe("normalizeOutputExt", () => {
    it("should convert jpeg to jpg", () => {
      expect(normalizeOutputExt("JPEG")).toBe("jpg");
    });
    it("should lowercase", () => {
      expect(normalizeOutputExt("PNG")).toBe("png");
    });
  });
});
