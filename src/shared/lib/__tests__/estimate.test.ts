import { expect, it, describe } from "bun:test";
import { estimateRemainingTime } from "../estimate";

describe("estimate", () => {
  describe("estimateRemainingTime", () => {
    it("should return 0 if no items processed", () => {
      expect(estimateRemainingTime(0, 10, Date.now())).toBe(0);
    });

    it("should estimate correctly", () => {
      const startTime = Date.now() - 10000; // 10 seconds ago
      // 5 items in 10 seconds -> 2 seconds per item
      // 5 items remaining -> 10 seconds remaining
      const remaining = estimateRemainingTime(5, 10, startTime, Date.now());
      expect(remaining).toBe(10);
    });

    it("should return 0 if all items done", () => {
      expect(estimateRemainingTime(10, 10, Date.now() - 10000)).toBe(0);
    });
  });
});
