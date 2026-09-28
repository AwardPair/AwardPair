import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SignInForm } from "@/components/auth/SignInForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to AwardPair to manage your Travel Wallet.",
};

export default async function SignInPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/wallet");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Sign in to AwardPair</CardTitle>
          <CardDescription>We&apos;ll email you a link — no password needed.</CardDescription>
        </CardHeader>
        <div className="mt-6">
          <SignInForm />
        </div>
      </Card>
    </div>
  );
}
