import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type UpdateSettingsBody = {
  userId?: string;
  energyLevel?: number;
  availableMinutes?: number;
};

export async function POST(request: Request) {
  let body: UpdateSettingsBody;

  try {
    body = (await request.json()) as UpdateSettingsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = body.userId?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (!Number.isInteger(body.energyLevel) || (body.energyLevel ?? 0) < 1 || (body.energyLevel ?? 0) > 3) {
    return NextResponse.json({ error: "energyLevel must be 1, 2, or 3." }, { status: 400 });
  }

  if (!Number.isInteger(body.availableMinutes) || ![5, 10, 15].includes(body.availableMinutes ?? 0)) {
    return NextResponse.json(
      { error: "availableMinutes must be one of 5, 10, or 15." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: {
        select: {
          status: true,
        },
      },
      preference: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!user || !user.preference || !user.subscription) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.subscription.status !== "active") {
    return NextResponse.json({ error: "Subscription is not active." }, { status: 403 });
  }

  await prisma.userPreference.update({
    where: { userId },
    data: {
      energyLevel: body.energyLevel,
      availableMinutes: body.availableMinutes,
    },
  });

  return NextResponse.json({
    ok: true,
    energyLevel: body.energyLevel,
    availableMinutes: body.availableMinutes,
  });
}
