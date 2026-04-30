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

    it("should build free crop args", () => {
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
  });
});
