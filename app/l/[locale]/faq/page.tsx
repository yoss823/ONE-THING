import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocShell } from "@/components/marketing/LegalDocShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqJsonLd, getFaqItems, getFaqPageHeading } from "@/lib/i18n/faq-page";
import { isSiteLocale, type SiteLocale } from "@/lib/i18n/locale";
import { getFaqMetadata } from "@/lib/seo/supporting-pages-metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: SiteLocale }> {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isSiteLocale(raw)) {
    notFound();
  }
  return getFaqMetadata(raw);
}

export default async function FaqPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isSiteLocale(raw)) {
    notFound();
  }

  const items = getFaqItems(raw);
  const h1 = getFaqPageHeading(raw);

  return (
    <LegalDocShell locale={raw} title={h1}>
      <JsonLd data={buildFaqJsonLd(raw)} />
      <p className="text-[#555]">
        {raw === "fr"
          ? "Réponses courtes sur le fonctionnement de ONE THING."
          : raw === "es"
            ? "Respuestas breves sobre cómo funciona ONE THING."
            : "Short answers about how ONE THING works."}
      </p>
      <div className="space-y-10">
        {items.map((item) => (
          <section key={item.question} className="border-b border-[#e7e7e7] pb-8 last:border-0">
            <h2 className="font-[var(--font-display)] text-xl text-[#151515]">{item.question}</h2>
            <p className="mt-3 text-[#444]">{item.answer}</p>
          </section>
        ))}
      </div>
    </LegalDocShell>
  );
}
