import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10">
        <Compass aria-hidden="true" className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have been moved, or the link may be out of date.
      </p>
      <Link
        href="/explore"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to Explore
      </Link>
    </div>
  );
}
