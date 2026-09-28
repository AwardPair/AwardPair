import { Hero } from "@/components/landing/Hero";
import { WalletPreview } from "@/components/landing/WalletPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <>
      <Hero />
      <WalletPreview />
      <HowItWorks />
    </>
  );
}
