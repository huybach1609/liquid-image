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
