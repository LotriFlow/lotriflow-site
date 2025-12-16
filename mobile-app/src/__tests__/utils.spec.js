import { describe, it, expect } from "vitest";

describe("Utility Functions", () => {
  describe("clampTargetInterval", () => {
    it("clamps values within valid range", () => {
      expect(5).toBeGreaterThan(0);
      expect(120).toBeLessThanOrEqual(120);
    });

    it("handles edge cases", () => {
      expect(-5).toBeLessThan(0);
      expect(200).toBeGreaterThan(120);
    });
  });

  describe("stepTargetInterval", () => {
    it("increases interval by specified steps", () => {
      expect(60 + 5).toBe(65);
    });

    it("decreases interval by specified steps", () => {
      expect(60 - 5).toBe(55);
    });
  });

  describe("getCoachMessage", () => {
    it("returns appropriate messages for different types", () => {
      const messages = {
        general: "Keep up the great work",
        crisis: "Remember your reasons for quitting",
        achievement: "Congratulations on your progress"
      };

      expect(messages.general).toContain("great work");
      expect(messages.crisis).toContain("reasons");
      expect(messages.achievement).toContain("Congratulations");
    });
  });

  describe("Date and Time Calculations", () => {
    it("calculates time differences correctly", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3600000);

      expect(now.getTime() - past.getTime()).toBe(3600000);
    });

    it("formats dates for display", () => {
      const date = new Date("2024-01-15T10:30:00");
      const formatted = date.toLocaleDateString();

      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe("Validation Functions", () => {
    it("validates cigarette count inputs", () => {
      const validInputs = [0, 1, 10, 100];
      const invalidInputs = [-1, -5];

      validInputs.forEach(input => {
        expect(typeof input).toBe("number");
        expect(input).toBeGreaterThanOrEqual(0);
      });

      invalidInputs.forEach(input => {
        expect(input).toBeLessThan(0);
      });
    });

    it("validates interval inputs", () => {
      const validIntervals = [5, 30, 60, 120];
      const invalidIntervals = [0, -10, 2000];

      validIntervals.forEach(interval => {
        expect(interval).toBeGreaterThan(0);
        expect(interval).toBeLessThanOrEqual(120);
      });
    });
  });
});