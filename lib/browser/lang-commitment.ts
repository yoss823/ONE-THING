const COOKIE_NAME = "onestep_lang_committed";
const COOKIE_VALUE = "1";

/** After a successful checkout return, the user should not switch site language from the top bar. */
export function writeLangCommittedCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE};path=/;max-age=31536000;SameSite=Lax`;
}

export function readLangCommittedFromCookie(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return new RegExp(`(?:^|; )${COOKIE_NAME}=${COOKIE_VALUE}(?:;|$)`).test(document.cookie);
}
