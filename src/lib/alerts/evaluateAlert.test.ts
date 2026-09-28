import { describe, expect, it } from "vitest";
import type { Pair } from "@/lib/domain";
import { findMatchingPairs, pairMatchesCriteria } from "./evaluateAlert";

function makePair(netCashCost: number, scoreValue: number): Pair {
  return {
    economics: { netCashCost: { amount: netCashCost, currency: "USD" } },
    score: { value: scoreValue, reasons: [] },
  } as unknown as Pair;
}

describe("pairMatchesCriteria", () => {
  it("matches when no criteria are set", () => {
    expect(pairMatchesCriteria(makePair(1000, 10), {})).toBe(true);
  });

  it("rejects a pair whose net cash cost exceeds the max", () => {
    expect(pairMatchesCriteria(makePair(500, 90), { maxNetCashCost: 400 })).toBe(false);
    expect(pairMatchesCriteria(makePair(400, 90), { maxNetCashCost: 400 })).toBe(true);
  });

  it("rejects a pair whose score is below the minimum", () => {
    expect(pairMatchesCriteria(makePair(500, 60), { minPairScore: 70 })).toBe(false);
    expect(pairMatchesCriteria(makePair(500, 70), { minPairScore: 70 })).toBe(true);
  });

  it("requires every set criterion to pass", () => {
    const criteria = { maxNetCashCost: 400, minPairScore: 70 };
    expect(pairMatchesCriteria(makePair(300, 90), criteria)).toBe(true);
    expect(pairMatchesCriteria(makePair(500, 90), criteria)).toBe(false);
    expect(pairMatchesCriteria(makePair(300, 50), criteria)).toBe(false);
  });
});

describe("findMatchingPairs", () => {
  it("filters to only the pairs that match", () => {
    const pairs = [makePair(300, 90), makePair(900, 90), makePair(300, 10)];
    const matches = findMatchingPairs(pairs, { maxNetCashCost: 400, minPairScore: 50 });
    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(pairs[0]);
  });
});
