import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/admin/session";
import { isSiteLocale } from "@/lib/i18n/locale";

function adminIsPublicPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot" ||
    pathname === "/admin/reset"
  );
}

function getJwtSecretBytes(): Uint8Array | null {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 16) {
    return null;
  }
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeMatch = /^\/l\/([^/]+)/.exec(pathname);
  if (localeMatch) {
    const loc = localeMatch[1];
    if (isSiteLocale(loc)) {
      const res = NextResponse.next();
      res.cookies.set("onestep_locale", loc, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (adminIsPublicPath(pathname)) {
      return NextResponse.next();
    }

    const secret = getJwtSecretBytes();
    if (!secret) {
      return new NextResponse("Admin authentication is not configured (ADMIN_JWT_SECRET).", {
        status: 503,
      });
    }

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/l/:path*", "/admin", "/admin/:path*"],
};
