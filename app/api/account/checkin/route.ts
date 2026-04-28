import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type CheckinBody = {
  userId?: string;
  mood?: string;
  note?: string;
};

const ALLOWED_MOODS = new Set(["too_easy", "right", "too_hard"]);

export async function POST(request: Request) {
  let body: CheckinBody;

  try {
    body = (await request.json()) as CheckinBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const mood = body.mood?.trim();
  const note = body.note?.trim() || undefined;

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (!mood || !ALLOWED_MOODS.has(mood)) {
    return NextResponse.json({ error: "mood is invalid." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  try {
    await prisma.userCheckin.create({
      data: {
        userId,
        mood,
        note,
      },
    });
  } catch (error) {
    console.error("Failed to save account check-in.", error);
    return NextResponse.json(
      { error: "Check-in is temporarily unavailable." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
