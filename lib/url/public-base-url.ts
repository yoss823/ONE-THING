const STABLE_VERCEL_HOST = "one-thing-nu.vercel.app";

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function addHttpsIfMissing(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function isEphemeralVercelDeploymentHost(host: string): boolean {
  if (!host.endsWith(".vercel.app")) {
    return false;
  }

  return host !== STABLE_VERCEL_HOST;
}

/**
 * Resolves the public base URL for links in emails and redirects.
 * Prefer APP_URL / NEXT_PUBLIC_BASE_URL, then VERCEL_URL. Avoid per-deployment *.vercel.app hosts
 * unless it is the stable production alias (e.g. one-thing-nu.vercel.app).
 */
export function tryResolvePublicBaseUrl(): string | null {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!raw) {
    return null;
  }

  const normalized = stripTrailingSlashes(addHttpsIfMissing(raw));
  let host: string;

  try {
    host = new URL(normalized).host;
  } catch {
    return null;
  }

  if (isEphemeralVercelDeploymentHost(host)) {
    return `https://${STABLE_VERCEL_HOST}`;
  }

  return normalized;
}
