import { expect, it, describe } from "bun:test";
import { formatFileSize, formatTime } from "../format";

describe("format", () => {
  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });

    it("should handle decimals", () => {
      expect(formatFileSize(1500)).toBe("1.46 KB");
      expect(formatFileSize(1500, 1)).toBe("1.5 KB");
    });
  });

  describe("formatTime", () => {
    it("should format seconds", () => {
      expect(formatTime(45)).toBe("45s");
    });

    it("should format minutes", () => {
      expect(formatTime(125)).toBe("2m 5s");
    });

    it("should format hours", () => {
      expect(formatTime(3665)).toBe("1h 1m");
    });
  });
});
