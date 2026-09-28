import type { Pair } from "@/lib/domain";

export interface AlertCriteria {
  /** Reject pairs whose net cash cost for the whole stay exceeds this amount (in the pair's currency). */
  maxNetCashCost?: number;
  /** Reject pairs whose Pair Score falls below this threshold (0-100). */
  minPairScore?: number;
}

export function pairMatchesCriteria(pair: Pair, criteria: AlertCriteria): boolean {
  if (criteria.maxNetCashCost !== undefined && pair.economics.netCashCost.amount > criteria.maxNetCashCost) {
    return false;
  }
  if (criteria.minPairScore !== undefined && pair.score.value < criteria.minPairScore) {
    return false;
  }
  return true;
}

export function findMatchingPairs(pairs: Pair[], criteria: AlertCriteria): Pair[] {
  return pairs.filter((pair) => pairMatchesCriteria(pair, criteria));
}
