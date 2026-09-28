import { SearchCard } from "@/components/landing/SearchCard";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-6 sm:px-6 sm:pt-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Where award flights meet hotel perks
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Find the trip your points and perks were meant for.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          AwardPair pairs an award-flight opportunity with a compatible
          premium-hotel stay, your card benefits, and any verified hotel
          promotions — into one explainable trip with honest, unblended
          economics. It&apos;s a discovery and valuation tool, not a booking
          engine.
        </p>
      </div>

      <div className="mt-8">
        <SearchCard />
      </div>
    </section>
  );
}
