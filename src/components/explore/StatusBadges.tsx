import { Clock, ShieldCheck } from "lucide-react";
import type { ConfidenceLevel, Freshness } from "@/lib/domain";
import { freshnessLabel } from "@/lib/domain";
import { Badge } from "@/components/ui/Badge";

const CONFIDENCE_TONE: Record<ConfidenceLevel, "success" | "warning" | "danger"> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceBadge({ level, className }: { level: ConfidenceLevel; className?: string }) {
  return (
    <Badge tone={CONFIDENCE_TONE[level]} className={className}>
      <ShieldCheck aria-hidden="true" className="h-3 w-3" />
      {CONFIDENCE_LABEL[level]}
    </Badge>
  );
}

export function FreshnessBadge({ freshness, className }: { freshness: Freshness; className?: string }) {
  const label = freshnessLabel(freshness);
  const needsAttention = label.includes("Stale") || label.includes("needs verification");
  return (
    <Badge tone={needsAttention ? "warning" : "neutral"} className={className}>
      <Clock aria-hidden="true" className="h-3 w-3" />
      {label}
    </Badge>
  );
}
