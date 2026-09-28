import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10">
        <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">{description}</p>
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Coming soon
      </p>
    </div>
  );
}
