import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

interface ExploreEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

export function ExploreEmptyState({ icon: Icon = SearchX, title, description }: ExploreEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-xl)] border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-muted">
        <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
