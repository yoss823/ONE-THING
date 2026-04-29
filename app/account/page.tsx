import { Suspense } from "react";
import { cookies } from "next/headers";

import { AccountClient } from "@/app/account/account-client";
import { getAccountUiCopy } from "@/lib/i18n/account-ui";
import type { SiteLocale } from "@/lib/i18n/locale";
import { normalizeSiteLocale } from "@/lib/i18n/locale";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const siteLocale: SiteLocale = normalizeSiteLocale(cookieStore.get("onestep_locale")?.value);
  const ui = getAccountUiCopy(siteLocale);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white text-[#111] px-6 py-12">
          <div className="max-w-xl mx-auto">
            <p className="text-sm text-[#666]">{ui.loadingAccount}</p>
          </div>
        </main>
      }
    >
      <AccountClient siteLocale={siteLocale} />
    </Suspense>
  );
}
