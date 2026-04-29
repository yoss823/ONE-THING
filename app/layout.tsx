import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { LanguageBar } from "@/components/LanguageBar";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ONE THING",
  description:
    "ONE THING sends one clear morning action for the categories you selected, plus a weekly summary and a monthly clarity check.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const htmlLang = normalizeSiteLocale(cookieStore.get("onestep_locale")?.value);

  return (
    <html lang={htmlLang} className={`${fraunces.variable} ${ibmPlexSans.variable}`}>
      <body>
        <LanguageBar />
        <Script
          src="https://phospho-nanocorp-prod--nanocorp-api-fastapi-app.modal.run/beacon/snippet.js?s=onestep"
          defer
        />
        {children}
      </body>
    </html>
  );
}
