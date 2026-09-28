import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "My Wallet",
};

export default function WalletPage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Your full wallet is on its way"
      description="Add the cards you hold, track statement credits you've used, and see exactly which benefits apply to each Pair."
    />
  );
}
