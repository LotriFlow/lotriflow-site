import { describe, it, expect } from "vitest";
import {
  calculateCigarettesAvoided,
  calculateMoneySaved,
} from "../utils/stats";

describe("stats helpers", () => {
  const baseline = 10;
  const packPrice = 8;
  const cigsPerPack = 20;

  it("calculates avoided correctly across days", () => {
    const logs = [
      "2024-01-01T10:00:00Z",
      "2024-01-01T12:00:00Z",
      "2024-01-02T09:00:00Z",
    ];
    const referenceNow = new Date("2024-01-02T12:00:00Z");
    expect(
      calculateCigarettesAvoided(baseline, logs, null, referenceNow)
    ).toBe(17);
  });

  it("returns negative values when logging more than the baseline", () => {
    const logs = new Array(25).fill("2024-01-01T10:00:00Z");
    const referenceNow = new Date("2024-01-02T12:00:00Z");
    expect(
      calculateCigarettesAvoided(baseline, logs, null, referenceNow)
    ).toBe(-5);
  });

  it("computes money saved based on avoided", () => {
    const logs = [
      "2024-01-01T10:00:00Z",
      "2024-01-01T12:00:00Z",
    ];
    const referenceNow = new Date("2024-01-01T12:00:00Z");
    expect(
      calculateMoneySaved(
        baseline,
        packPrice,
        cigsPerPack,
        logs,
        null,
        referenceNow
      )
    ).toBe(3.2);
  });

  it("avoided spans multiple days and rounds money to 2 decimals", () => {
    const logs = [
      "2024-01-01T10:00:00Z",
      "2024-01-02T11:00:00Z",
      "2024-01-03T09:00:00Z",
      "2024-01-03T18:00:00Z",
    ];
    const referenceNow = new Date("2024-01-03T12:00:00Z");
    expect(
      calculateCigarettesAvoided(5, logs, null, referenceNow)
    ).toBe(11);
    expect(
      calculateMoneySaved(
        5,
        packPrice,
        cigsPerPack,
        logs,
        null,
        referenceNow
      )
    ).toBe(4.4);
  });

  it("captures over-baseline behavior across multiple days", () => {
    const logs = [
      "2024-01-01T10:00:00Z",
      "2024-01-01T12:00:00Z",
      "2024-01-01T18:00:00Z",
      "2024-01-02T10:00:00Z",
      "2024-01-02T12:00:00Z",
      "2024-01-02T18:00:00Z",
      "2024-01-02T20:00:00Z",
      "2024-01-02T22:00:00Z",
      "2024-01-02T23:00:00Z",
      "2024-01-03T10:00:00Z",
      "2024-01-03T12:00:00Z",
      "2024-01-03T18:00:00Z",
    ];
    const referenceNow = new Date("2024-01-03T12:00:00Z");
    expect(
      calculateCigarettesAvoided(10, logs, null, referenceNow)
    ).toBe(18);

    const heavyLogs = new Array(40).fill("2024-01-01T10:00:00Z");
    expect(
      calculateCigarettesAvoided(10, heavyLogs, null, referenceNow)
    ).toBe(-10);
  });

  it("rounds money saved to cents with fractional pricing", () => {
    const logs = ["2024-01-01T10:00:00Z"];
    const referenceNow = new Date("2024-01-01T12:00:00Z");
    expect(
      calculateMoneySaved(
        12,
        7.99,
        19,
        logs,
        null,
        referenceNow
      )
    ).toBe(4.63);
  });

  it("handles very low baselines without negative rounding", () => {
    const logs = ["2024-01-01T10:00:00Z"];
    const referenceNow = new Date("2024-01-01T12:00:00Z");
    expect(calculateCigarettesAvoided(1, logs, null, referenceNow)).toBe(0);
    expect(
      calculateMoneySaved(1, 9, 20, logs, null, referenceNow)
    ).toBe(0);
  });
});
