import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AwardPair — Where award flights meet hotel perks",
    template: "%s · AwardPair",
  },
  description:
    "AwardPair pairs award-flight opportunities with compatible premium-hotel stays, your card benefits, and verified promotions, so you can see the full value of a trip in one place.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>
          <Nav userEmail={data.user?.email ?? null} />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  );
}
