"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithMagicLink, type SignInFormState } from "@/app/auth/actions";

const INITIAL_STATE: SignInFormState = { status: "idle" };

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, INITIAL_STATE);

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-[var(--radius-md)] bg-success-bg px-3 py-2.5 text-sm text-success">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input name="email" type="email" label="Email" placeholder="you@example.com" icon={<Mail aria-hidden="true" className="h-4 w-4" />} required autoComplete="email" />
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Sending link…" : "Send sign-in link"}
      </Button>
    </form>
  );
}
