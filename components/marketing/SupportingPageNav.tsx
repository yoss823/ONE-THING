import Link from "next/link";

import { getHomePageCopy } from "@/lib/i18n/home-page";
import type { SiteLocale } from "@/lib/i18n/locale";
import { CONTACT_EMAIL } from "@/lib/site/contact";

type Props = {
  locale: SiteLocale;
};

export function SupportingPageNav({ locale }: Props) {
  const home = getHomePageCopy(locale);

  return (
    <nav
      className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#e7e7e7] pt-8 text-sm text-[#555]"
      aria-label="Legal and help"
    >
      <Link href={`/l/${locale}/faq`} className="underline underline-offset-4 hover:text-[#111]">
        {home.footerFaq}
      </Link>
      <Link href={`/l/${locale}/legal`} className="underline underline-offset-4 hover:text-[#111]">
        {home.footerLegal}
      </Link>
      <Link href={`/l/${locale}/privacy`} className="underline underline-offset-4 hover:text-[#111]">
        {home.footerPrivacy}
      </Link>
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#111]">
        {home.footerContact}
      </a>
    </nav>
  );
}
