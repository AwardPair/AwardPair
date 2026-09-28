import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign-in error",
};

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-danger-bg">
        <AlertTriangle aria-hidden="true" className="h-6 w-6 text-danger" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign-in link didn&apos;t work</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This link may have expired or already been used. Request a new one below.
      </p>
      <Link
        href="/auth/sign-in"
        className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </Link>
    </div>
  );
}
