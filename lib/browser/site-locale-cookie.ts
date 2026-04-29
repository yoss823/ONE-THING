/** Sets the cookie read by the server for UI language (home, onboarding, account shell). */
export function writeSiteLocaleCookie(locale: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `onestep_locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
}
