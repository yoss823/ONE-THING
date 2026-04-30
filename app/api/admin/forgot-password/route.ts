import { createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sendAdminPasswordResetEmail } from "@/lib/email/sendAdminPasswordReset";
import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

type Body = {
  email?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export async function POST(request: Request) {
  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  const generic = NextResponse.json({
    ok: true,
    message: "If an admin account exists for this email, a reset link was sent.",
  });

  if (!admin) {
    return generic;
  }

  const base = tryResolvePublicBaseUrl();
  if (!base) {
    console.error("forgot-password: APP_URL / NEXT_PUBLIC_BASE_URL / VERCEL_URL not set");
    return NextResponse.json(
      { error: "Server URL is not configured; cannot send reset link." },
      { status: 503 },
    );
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const created = await prisma.adminPasswordResetToken.create({
    data: {
      adminUserId: admin.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = new URL("/admin/reset", base);
  resetUrl.searchParams.set("token", rawToken);

  try {
    await sendAdminPasswordResetEmail(email, resetUrl.toString());
  } catch (err) {
    console.error("Admin password reset email failed:", err);
    await prisma.adminPasswordResetToken.delete({ where: { id: created.id } }).catch(() => {});
    return NextResponse.json(
      { error: "Email could not be sent. Check RESEND_API_KEY and sender domain." },
      { status: 503 },
    );
  }

  return generic;
}
