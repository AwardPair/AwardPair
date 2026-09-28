import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ExploreSearchParams } from "@/lib/search/parseExploreSearchParams";
import { saveSearch } from "@/app/alerts/actions";

export function SaveSearchForm({ params, signedIn }: { params: ExploreSearchParams; signedIn: boolean }) {
  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/sign-in?next=/explore" className="font-medium text-primary hover:underline">
          Sign in
        </Link>{" "}
        to save this search and get alerted when a Pair matches your price or score threshold.
      </p>
    );
  }

  return (
    <form action={saveSearch} className="flex flex-wrap items-end gap-2 rounded-[var(--radius-lg)] border border-dashed border-border p-3">
      <input type="hidden" name="tab" value={params.tab} />
      <input type="hidden" name="from" value={params.from} />
      <input type="hidden" name="to" value={params.to} />
      <input type="hidden" name="departFrom" value={params.departFrom} />
      <input type="hidden" name="departTo" value={params.departTo} />
      {params.cabin ? <input type="hidden" name="cabin" value={params.cabin} /> : null}
      {params.maxPoints !== undefined ? <input type="hidden" name="maxPoints" value={params.maxPoints} /> : null}
      {params.maxStops !== undefined ? <input type="hidden" name="maxStops" value={params.maxStops} /> : null}
      <Input
        name="name"
        label="Name this search"
        hideLabel
        placeholder="Name this search, e.g. Tokyo business class under $400"
        className="min-w-[16rem] flex-1"
        required
      />
      <Button type="submit" size="sm">
        <Bookmark aria-hidden="true" className="h-3.5 w-3.5" />
        Save this search
      </Button>
    </form>
  );
}
