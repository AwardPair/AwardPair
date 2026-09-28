import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/server";
import { getCardCatalog, getUserPreferences, getUserWallet } from "@/lib/wallet/queries";
import { DEFAULT_BENEFIT_PREFERENCES } from "@/lib/domain";
import { addCard, removeCard, updatePreferences } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Wallet",
  description: "Manage the cards you carry and how you value soft benefits like breakfast and property credits.",
};

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/auth/sign-in?next=/wallet");

  const [catalog, wallet, preferences] = await Promise.all([
    getCardCatalog(),
    getUserWallet(authData.user.id),
    getUserPreferences(authData.user.id),
  ]);

  const addedProductIds = new Set(wallet.map((c) => c.cardProductId));
  const availableToAdd = catalog.filter((c) => !addedProductIds.has(c.id));

  const breakfastValue = preferences?.breakfastValueAmount ?? DEFAULT_BENEFIT_PREFERENCES.breakfastValuePerPerson.value;
  const usablePercent = Math.round((preferences?.propertyCreditUsableFraction ?? DEFAULT_BENEFIT_PREFERENCES.propertyCreditUsableFraction) * 100);
  const lateCheckoutValue = preferences?.lateCheckoutValueAmount ?? "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the cards you carry so AwardPair applies their statement credits automatically, and tell us how you value soft
          perks so the perk-adjusted numbers reflect what they&apos;re actually worth to you.
        </p>
      </div>

      <section aria-labelledby="your-cards-heading" className="flex flex-col gap-4">
        <h2 id="your-cards-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your cards
        </h2>

        {wallet.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t added any cards yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wallet.map((card) => (
              <li key={card.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10">
                      <CreditCard aria-hidden="true" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{card.productName}</p>
                      <p className="text-xs text-muted-foreground">{card.issuerName}</p>
                    </div>
                  </div>
                  <form action={removeCard}>
                    <input type="hidden" name="userCardId" value={card.id} />
                    <Button variant="ghost" size="sm" type="submit" aria-label={`Remove ${card.productName}`}>
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {availableToAdd.length > 0 ? (
          <form action={addCard} className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-dashed border-border p-4">
            <div className="min-w-[14rem] flex-1">
              <Select name="cardProductId" label="Add a card" defaultValue={availableToAdd[0].id}>
                {availableToAdd.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.issuerName} {product.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="md">
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add card
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            All demo cards ({catalog.length}) are already in your wallet.
          </p>
        )}
      </section>

      <section aria-labelledby="preferences-heading">
        <Card className="p-5 sm:p-6">
          <CardHeader>
            <CardTitle id="preferences-heading">Benefit preferences</CardTitle>
            <CardDescription>
              These only affect the perk-adjusted value shown alongside net cash cost — they never change the cash numbers
              themselves.
            </CardDescription>
          </CardHeader>
          <form action={updatePreferences} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="breakfastValueAmount"
              type="number"
              min={0}
              step="1"
              label="Breakfast value per person ($)"
              defaultValue={breakfastValue}
            />
            <Input
              name="propertyCreditUsableFraction"
              type="number"
              min={0}
              max={100}
              step="5"
              label="Property credit you actually use (%)"
              defaultValue={usablePercent}
            />
            <Input
              name="lateCheckoutValueAmount"
              type="number"
              min={0}
              step="1"
              label="Late checkout value ($, optional)"
              defaultValue={lateCheckoutValue}
              placeholder="Not valued"
            />
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" size="md">
                Save preferences
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
