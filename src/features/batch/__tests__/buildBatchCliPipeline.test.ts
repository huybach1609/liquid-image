import { expect, it, describe } from "bun:test";
import { buildBatchCliArgs, buildBatchOutputPath } from "../buildBatchCliPipeline";

describe("buildBatchCliPipeline", () => {
  describe("buildBatchCliArgs", () => {
    it("should build args for enabled steps", () => {
      const pipeline: any[] = [
        {
          id: "1",
          functionId: "Convert",
          enabled: true,
          params: { outputFormat: "PNG", quality: 90 }
        },
        {
          id: "2",
          functionId: "Rotate",
          enabled: false,
          params: { angle: 90 }
        }
      ];
      
      const args = buildBatchCliArgs(pipeline);
      // From buildConvertOperationArgs: ["-quality", "90", "-define", "png:compression-level=9"]
      expect(args).toContain("-quality");
      expect(args).toContain("90");
      expect(args).not.toContain("-rotate");
    });

    it("should include diskCacheLimit and memoryLimit flags if specified", () => {
      const pipeline: any[] = [
        {
          id: "1",
          functionId: "Convert",
          enabled: true,
          params: { outputFormat: "PNG" }
        }
      ];

      const args = buildBatchCliArgs(pipeline, {
        diskCacheLimit: "1 GB",
        memoryLimit: "512 MB"
      });

      expect(args).toContain("-limit");
      expect(args).toContain("disk");
      expect(args).toContain("1GB");
      expect(args).toContain("memory");
      expect(args).toContain("512MB");
    });

    it("should include -strip and -colorspace flags when specified in options without Convert step", () => {
      const pipeline: any[] = [
        {
          id: "1",
          functionId: "Rotate",
          enabled: true,
          params: { rotateDegrees: 90 },
        },
      ];

      const args = buildBatchCliArgs(pipeline, {
        stripMetadata: true,
        defaultColorProfile: "Adobe RGB",
      });

      expect(args).toContain("-strip");
      expect(args).toContain("-colorspace");
      expect(args).toContain("Adobe98");
    });
  });

  describe("buildBatchOutputPath", () => {
    it("should handle {name} pattern", () => {
      const path = buildBatchOutputPath(
        "/home/user/photo.jpg",
        "./out",
        "png",
        "{name}_out"
      );
      expect(path).toBe("./out/photo_out.png");
    });

    it("should handle {counter} pattern", () => {
      const path = buildBatchOutputPath(
        "/home/user/photo.jpg",
        "./out",
        "jpg",
        "img_{counter}",
        4 // index 4 -> 005
      );
      expect(path).toBe("./out/img_005.jpg");
    });

    it("should handle {date} pattern with custom dateFormat", () => {
      const fixedDate = new Date(2026, 8, 26); // 2026-09-26
      const pathYMD = buildBatchOutputPath(
        "/home/user/photo.jpg",
        "./out",
        "png",
        "{date}_{name}",
        0,
        { dateFormat: "YYYY-MM-DD", now: fixedDate }
      );
      expect(pathYMD).toBe("./out/2026-09-26_photo.png");

      const pathDMY = buildBatchOutputPath(
        "/home/user/photo.jpg",
        "./out",
        "png",
        "date-name",
        0,
        { dateFormat: "DD-MM-YYYY", now: fixedDate }
      );
      expect(pathDMY).toBe("./out/26-09-2026_photo.png");
    });

    it("should handle windows paths", () => {
      const path = buildBatchOutputPath(
        "C:\\Users\\test\\image.PNG",
        "D:\\output",
        "webp",
        "{name}_v1"
      );
      // The current implementation joins with /
      expect(path).toBe("D:\\output/image_v1.webp");
    });
  });
});
