import { expect, it, describe } from "bun:test";
import { scaledCropParamsForFullInput, buildCropOperationArgs } from "../cropOperationArgs";

describe("cropOperationArgs", () => {
  describe("scaledCropParamsForFullInput", () => {
    it("should scale coordinates correctly", () => {
      const params = {
        cropMethod: "free",
        cropX: 100,
        cropY: 100,
        cropW: 200,
        cropH: 200
      };
      const scale = {
        fullWidth: 2000,
        fullHeight: 1000,
        previewWidth: 1000,
        previewHeight: 500
      };
      // sx = 2, sy = 2
      const scaled = scaledCropParamsForFullInput(params, scale);
      expect(scaled.cropX).toBe(200);
      expect(scaled.cropY).toBe(200);
      expect(scaled.cropW).toBe(400);
      expect(scaled.cropH).toBe(400);
    });

    it("should not scale if already at full res", () => {
      const params = { cropMethod: "free", cropX: 100 };
      const scale = { 
        fullWidth: 1000, 
        fullHeight: 500, 
        previewWidth: 1000, 
        previewHeight: 500 
      };
      const scaled = scaledCropParamsForFullInput(params, scale);
      expect(scaled.cropX).toBe(100);
    });
  });

  describe("buildCropOperationArgs", () => {
    it("should build trim args", () => {
      const args = buildCropOperationArgs({ cropMethod: "trim", cropTrimFuzz: 15 });
      expect(args).toEqual(["-fuzz", "15%", "-trim", "+repage"]);
    });

    it("should build shave args", () => {
      const args = buildCropOperationArgs({ cropMethod: "shave", cropShaveH: 20, cropShaveV: 30 });
      expect(args).toEqual(["-shave", "20x30"]);
    });

    it("should build free crop args with Center gravity", () => {
      const args = buildCropOperationArgs({ 
        cropMethod: "free", 
        cropX: 10, 
        cropY: 20, 
        cropW: 300, 
        cropH: 400,
        cropGravity: "Center"
      });
      expect(args).toEqual(["-gravity", "Center", "-crop", "300x400+10+20", "+repage"]);
    });

    it("should build free crop args with SE gravity", () => {
      const args = buildCropOperationArgs({
        cropMethod: "free",
        cropX: 0, cropY: 0, cropW: 500, cropH: 500,
        cropGravity: "SE"
      });
      expect(args).toEqual(["-gravity", "SouthEast", "-crop", "500x500+0+0", "+repage"]);
    });

    it("should use canvas-computed W/H for 1:1 aspect (no hardcoded 800x800)", () => {
      // For a 4000×2251 image, a 1:1 crop covers 2251×2251 at center
      const args = buildCropOperationArgs({
        cropMethod: "free",
        cropAspectRatio: "1:1",
        cropX: 875, cropY: 0,
        cropW: 2251, cropH: 2251,
        cropGravity: "Center"
      });
      // Must NOT produce the old hardcoded 800x800
      expect(args).toEqual(["-gravity", "Center", "-crop", "2251x2251+875+0", "+repage"]);
      expect(args.join(" ")).not.toContain("800x800");
    });

    it("should use canvas-computed W/H for 16:9 aspect (no hardcoded 1280x720)", () => {
      const args = buildCropOperationArgs({
        cropMethod: "free",
        cropAspectRatio: "16:9",
        cropX: 0, cropY: 0,
        cropW: 4000, cropH: 2250,
        cropGravity: "NW"
      });
      expect(args).toEqual(["-gravity", "NorthWest", "-crop", "4000x2250+0+0", "+repage"]);
      expect(args.join(" ")).not.toContain("1280x720");
    });

    it("should handle 4:3 aspect ratio with actual image dimensions", () => {
      const args = buildCropOperationArgs({
        cropMethod: "free",
        cropAspectRatio: "4:3",
        cropX: 100, cropY: 50,
        cropW: 3000, cropH: 2251,
        cropGravity: "NW"
      });
      expect(args).toEqual(["-gravity", "NorthWest", "-crop", "3000x2251+100+50", "+repage"]);
    });

    it("should produce empty args when W or H is 0", () => {
      const args = buildCropOperationArgs({
        cropMethod: "free",
        cropX: 0, cropY: 0, cropW: 0, cropH: 0
      });
      expect(args).toEqual([]);
    });
  });
});
