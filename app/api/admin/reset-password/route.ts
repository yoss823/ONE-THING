import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type Body = {
  token?: string;
  password?: string;
};

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

  const rawToken = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!rawToken || password.length < 10) {
    return NextResponse.json(
      { error: "A valid token and a new password (min 10 characters) are required." },
      { status: 400 },
    );
  }

  const tokenHash = hashToken(rawToken);

  const row = await prisma.adminPasswordResetToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, adminUserId: true },
  });

  if (!row) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: row.adminUserId },
      data: { passwordHash },
    }),
    prisma.adminPasswordResetToken.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
