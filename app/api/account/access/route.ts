import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type AccessBody = {
  email?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: AccessBody;

  try {
    body = (await request.json()) as AccessBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user || user.subscription?.status !== "active") {
    return NextResponse.json(
      { error: "No active account found for this email." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    accountUrl: `/account?userId=${encodeURIComponent(user.id)}`,
  });
}
