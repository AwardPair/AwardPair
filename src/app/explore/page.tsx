import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <ComingSoon
      icon={Compass}
      title="Explore is on its way"
      description="Browse open-ended award-pair ideas by region and season, before you lock in exact dates. We're building this next."
    />
  );
}
