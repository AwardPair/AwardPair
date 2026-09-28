import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Pair Calendar",
};

export default function PairCalendarPage() {
  return (
    <ComingSoon
      icon={CalendarRange}
      title="Pair Calendar is on its way"
      description="See how Pair scores and total economics shift night by night across a date range, so you can pick the best window to fly."
    />
  );
}
