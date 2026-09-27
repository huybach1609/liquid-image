import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSingleCliPipeline,
  buildSingleCliPreview,
  estimateProxyDimensions,
} from "../buildSingleCliPreview";
import { previewMaxEdgeFromSetting } from "../previewScale";

describe("Processing & Performance Settings", () => {
  describe("Resource limits in CLI pipeline", () => {
    it("should include -limit memory and -limit disk in single CLI pipeline when configured", () => {
      const cli = buildSingleCliPipeline({
        selectedFile: "/tmp/sample.png",
        operations: [
          {
            selectedFunction: "Convert",
            functionParams: { outputFormat: "webp", quality: 85 },
          },
        ],
        outputParams: { outputDir: "./output", outputName: "sample", outputFormat: "webp" },
        limits: {
          memoryLimit: "512MB",
          diskCacheLimit: "1GB",
        },
      });

      expect(cli).toContain("magick -limit memory 512MB -limit disk 1GB");
      expect(cli).toContain('"sample.png"');
      expect(cli).toContain('"./output/sample.webp"');
    });

    it("should omit limits if set to Unlimited or omitted", () => {
      const cli = buildSingleCliPipeline({
        selectedFile: "/tmp/sample.png",
        operations: [
          {
            selectedFunction: "Convert",
            functionParams: { outputFormat: "jpg" },
          },
        ],
        limits: {
          memoryLimit: "Unlimited",
          diskCacheLimit: "Unlimited",
        },
      });

      expect(cli).not.toContain("-limit memory");
      expect(cli).not.toContain("-limit disk");
    });

    it("should pass limits through buildSingleCliPreview", () => {
      const cli = buildSingleCliPreview({
        selectedFile: "/tmp/photo.jpg",
        selectedFunction: "Rotate",
        functionParams: { rotateDegrees: 90 },
        limits: {
          memoryLimit: "2GB",
          diskCacheLimit: "5GB",
        },
      });

      expect(cli).toContain("-limit memory 2GB -limit disk 5GB");
      expect(cli).toContain("-rotate 90");
    });
  });

  describe("Preview resolution & scaling with docs/test_file.jpg", () => {
    it("should verify test_file.jpg exists and has valid JPEG magic bytes", () => {
      const todosPath = resolve(process.cwd(), "docs/todos/test_file.jpg");
      const rootDocsPath = resolve(process.cwd(), "docs/test_file.jpg");
      const testFilePath = existsSync(todosPath) ? todosPath : rootDocsPath;
      const buffer = readFileSync(testFilePath);
      expect(buffer.length).toBeGreaterThan(0);
      // JPEG magic numbers: 0xFF, 0xD8, 0xFF
      expect(buffer[0]).toBe(0xff);
      expect(buffer[1]).toBe(0xd8);
      expect(buffer[2]).toBe(0xff);
    });

    it("should map previewMaxEdgeFromSetting accurately", () => {
      expect(previewMaxEdgeFromSetting("800px")).toBe(800);
      expect(previewMaxEdgeFromSetting("1200px")).toBe(1200);
      expect(previewMaxEdgeFromSetting("full")).toBe(99999);
      expect(previewMaxEdgeFromSetting("unknown")).toBe(1200);
    });

    it("should correctly estimate proxy dimensions for test_file.jpg (1600x1200)", () => {
      const origW = 1600;
      const origH = 1200;

      // 800px limit: max edge 800 (1600 -> 800, 1200 -> 600)
      const res800 = estimateProxyDimensions(origW, origH, "800px");
      expect(res800).toEqual({ width: 800, height: 600 });

      // 1200px limit: max edge 1200 (1600 -> 1200, 1200 -> 900)
      const res1200 = estimateProxyDimensions(origW, origH, "1200px");
      expect(res1200).toEqual({ width: 1200, height: 900 });

      // full resolution: retains 1600x1200
      const resFull = estimateProxyDimensions(origW, origH, "full");
      expect(resFull).toEqual({ width: 1600, height: 1200 });
    });
  });
});
