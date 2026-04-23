import { NextResponse } from "next/server";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email");
  const redirectUrl = new URL("/unsubscribe", requestUrl.origin);

  if (email) {
    redirectUrl.searchParams.set("email", email);
  }

  return NextResponse.redirect(redirectUrl);
}
