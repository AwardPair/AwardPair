"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { VerificationHandoff } from "@/lib/handoff/hotelVerification";

const LINK_BUTTON_CLASSES =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * "Check exact price" verification/handoff actions. AwardPair does not book
 * anything here — it copies the stay details to the clipboard and hands the
 * user off to the official program portal to confirm the live price.
 */
export function VerificationHandoffActions({ handoff }: { handoff: VerificationHandoff }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(handoff.clipboardText);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      // Some browsers block clipboard access outside a secure/user-gesture context;
      // the text stays visible below as a fallback the user can select manually.
      setCopyFailed(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        AwardPair doesn&apos;t book this stay. Verify the exact live price on the official portal before you act.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
          {copied ? "Copied" : "Copy stay details"}
        </Button>
        <a href={handoff.portalUrl} target="_blank" rel="noopener noreferrer" className={cn(LINK_BUTTON_CLASSES)}>
          Verify on {handoff.portalLabel}
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
      {copied ? (
        <p role="status" className="rounded-[var(--radius-md)] bg-success-bg px-3 py-2 text-xs text-success">
          Copied: &ldquo;{handoff.clipboardText}&rdquo;
        </p>
      ) : null}
      {copyFailed ? (
        <p role="status" className="rounded-[var(--radius-md)] bg-warning-bg px-3 py-2 text-xs text-warning">
          Couldn&apos;t copy automatically — select and copy this text: &ldquo;{handoff.clipboardText}&rdquo;
        </p>
      ) : null}
    </div>
  );
}
