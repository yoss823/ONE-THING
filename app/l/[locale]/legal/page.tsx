import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocShell } from "@/components/marketing/LegalDocShell";
import { getLegalPageContent } from "@/lib/i18n/legal-page";
import { isSiteLocale, type SiteLocale } from "@/lib/i18n/locale";
import { getLegalMetadata } from "@/lib/seo/supporting-pages-metadata";

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
  return getLegalMetadata(raw);
}

export default async function LegalPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isSiteLocale(raw)) {
    notFound();
  }

  const content = getLegalPageContent(raw);

  return (
    <LegalDocShell locale={raw} title={content.h1}>
      <p className="text-[#555]">{content.intro}</p>
      <div className="space-y-10">
        {content.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-[var(--font-display)] text-xl text-[#151515]">{section.title}</h2>
            <div className="mt-3 space-y-3 text-[#444]">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.id}-${i}`}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </LegalDocShell>
  );
}
