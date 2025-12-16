import { describe, it, expect } from "vitest";
import { computeTimerState } from "../utils/stats";

describe("timer state", () => {
  it("marks as early when interval not reached", () => {
    const now = new Date("2024-01-02T00:00:00Z");
    const last = new Date("2024-01-02T00:00:00Z");
    const state = computeTimerState(last, 60, now);
    expect(state.isEarly).toBe(true);
    expect(state.remainingSeconds).toBeGreaterThan(3500);
  });

  it("marks as ready when interval passed", () => {
    const now = new Date("2024-01-02T02:00:00Z");
    const last = new Date("2024-01-02T00:00:00Z");
    const state = computeTimerState(last, 60, now);
    expect(state.isEarly).toBe(false);
    expect(state.remainingSeconds).toBe(0);
    expect(state.elapsedSeconds).toBe(7200);
  });

  it("uses sane defaults when data missing", () => {
    const state = computeTimerState(null, null, new Date());
    expect(state.isEarly).toBe(false);
    expect(state.elapsedSeconds).toBe(0);
    expect(state.remainingSeconds).toBe(0);
  });
});
