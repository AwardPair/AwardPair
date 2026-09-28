import type { PairScoreReason } from "@/lib/domain";

export const SCORE_DIMENSION_LABELS: Record<string, string> = {
  flightCabin: "Cabin",
  flightPointsEfficiency: "Points efficiency",
  flightAvailability: "Seat availability",
  flightStops: "Routing",
  hotelNetCost: "Hotel net cost",
  hotelPromotion: "Active promotion",
  hotelBenefitCapture: "Card credit captured",
  dataConfidence: "Data confidence",
};

/** The Pair Score's contributing reasons, ranked highest-weight first (as computed). */
export function PairScoreReasons({ reasons, limit }: { reasons: PairScoreReason[]; limit?: number }) {
  const shown = limit ? reasons.slice(0, limit) : reasons;
  return (
    <ul className="flex flex-col gap-1.5">
      {shown.map((reason) => (
        <li key={reason.dimension} className="flex items-start gap-2 text-sm text-foreground/85">
          <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            <span className="font-medium text-foreground">{SCORE_DIMENSION_LABELS[reason.dimension] ?? reason.dimension}:</span>{" "}
            {reason.explanation}
          </span>
        </li>
      ))}
    </ul>
  );
}
