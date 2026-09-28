import type { Metadata } from "next";
import { BellRing } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Alerts",
};

export default function AlertsPage() {
  return (
    <ComingSoon
      icon={BellRing}
      title="Alerts are on their way"
      description="Get notified when award space, hotel rates, or promotions change for the Pairs you're tracking."
    />
  );
}
