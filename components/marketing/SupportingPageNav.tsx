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
      className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#e2ded6] pt-8 text-sm text-[#4a4a4a]"
      aria-label="Legal and help"
    >
      <Link href={`/l/${locale}/faq`} className="underline underline-offset-4 hover:text-[#0a0a0a]">
        {home.footerFaq}
      </Link>
      <Link href={`/l/${locale}/legal`} className="underline underline-offset-4 hover:text-[#0a0a0a]">
        {home.footerLegal}
      </Link>
      <Link href={`/l/${locale}/privacy`} className="underline underline-offset-4 hover:text-[#0a0a0a]">
        {home.footerPrivacy}
      </Link>
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#0a0a0a]">
        {home.footerContact}
      </a>
    </nav>
  );
}
