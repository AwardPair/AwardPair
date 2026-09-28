import { Plane, Building2, ScrollText } from "lucide-react";

const STEPS = [
  {
    icon: Plane,
    title: "Find the seat",
    description:
      "We search award availability across the mileage programs you use, so you know exactly which flights are actually bookable with points.",
  },
  {
    icon: Building2,
    title: "Match the stay",
    description:
      "AwardPair aligns your true local arrival date with premium-hotel availability and program benefits — Fine Hotels + Resorts, The Hotel Collection, The Edit, and more.",
  },
  {
    icon: ScrollText,
    title: "Understand the value",
    description:
      "See the reference price, what you'd actually pay after your card credits, and the perk-adjusted value — as separate, honest numbers, never blended into one.",
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 id="how-it-works-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Find the seat. Match the stay. Understand the value.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          A Pair is a complete opportunity, not three separate searches. Here&apos;s
          how AwardPair puts one together.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <step.icon aria-hidden="true" className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
