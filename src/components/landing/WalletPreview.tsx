import { CreditCard, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DEMO_CARD_BENEFIT_RULES,
  DEMO_CARD_ISSUERS,
  DEMO_CARD_PRODUCTS,
} from "@/lib/fixtures/benefits";
import { DEMO_HOTEL_PROGRAMS } from "@/lib/fixtures/hotels";

function describeBenefit(cardProductId: string): string | undefined {
  const rule = DEMO_CARD_BENEFIT_RULES.find((r) => r.cardProductId === cardProductId);
  if (!rule) return undefined;

  const programNames = (rule.applicableProgramIds ?? [])
    .map((id) => Object.values(DEMO_HOTEL_PROGRAMS).find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const period = rule.period === "calendar_year" ? "year" : rule.period === "cardmember_year" ? "cardmember year" : "stay";
  const scope = programNames.length ? ` toward ${programNames.join(" & ")} stays` : "";

  return `$${rule.maxAmount.value}/${period} hotel credit${scope}`;
}

const FEATURED_CARD_IDS = [
  DEMO_CARD_PRODUCTS.AMEX_PLATINUM.id,
  DEMO_CARD_PRODUCTS.CHASE_SAPPHIRE_RESERVE.id,
];

export function WalletPreview() {
  return (
    <section aria-labelledby="wallet-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="wallet-heading" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Travel Wallet
        </h2>
        <Badge tone="neutral">Sample</Badge>
      </div>
      <p className="mt-2 max-w-xl text-lg text-foreground">
        Add the cards you carry and AwardPair applies their statement credits
        automatically wherever they qualify. Here&apos;s what that looks like
        with two illustrative cards.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_CARD_IDS.map((cardProductId) => {
          const cardProduct = Object.values(DEMO_CARD_PRODUCTS).find((c) => c.id === cardProductId);
          if (!cardProduct) return null;
          const issuer = Object.values(DEMO_CARD_ISSUERS).find((i) => i.id === cardProduct.issuerId);
          const benefit = describeBenefit(cardProduct.id);

          return (
            <Card key={cardProduct.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10">
                  <CreditCard aria-hidden="true" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cardProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{issuer?.name}</p>
                </div>
              </div>
              {benefit ? (
                <p className="text-sm text-muted-foreground">{benefit} (illustrative — verify current terms).</p>
              ) : null}
            </Card>
          );
        })}

        <Card className="flex flex-col items-start justify-center gap-3 border-dashed p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-muted">
            <Plus aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Add your own cards</p>
          <p className="text-sm text-muted-foreground">
            Wallet setup isn&apos;t wired up yet — this is a preview of what
            it will look like.
          </p>
          <Button variant="secondary" size="sm">
            Add a card
          </Button>
        </Card>
      </div>
    </section>
  );
}
