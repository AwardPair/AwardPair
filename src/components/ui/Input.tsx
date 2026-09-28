import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, icon, hideLabel, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={cn(
          "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {icon ? (
          <span className="pointer-events-none absolute left-3 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
            icon && "pl-9",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
});
