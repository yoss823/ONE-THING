import { ActionCategory } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const PLAN_CATEGORY_COUNT: Record<string, 1 | 2 | 3> = {
  tier_1: 1,
  tier_2: 2,
  tier_3: 3,
};

type UpdatePreferencesBody = {
  userId?: string;
  categories?: string[];
};

const CATEGORY_MAP: Record<string, ActionCategory> = {
  mental_clarity: ActionCategory.MENTAL_CLARITY,
  organization: ActionCategory.ORGANIZATION,
  health_energy: ActionCategory.HEALTH_ENERGY,
  work_business: ActionCategory.WORK_BUSINESS,
  personal_projects: ActionCategory.PERSONAL_PROJECTS,
  relationships: ActionCategory.RELATIONSHIPS,
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function getMonthWindow(now: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export async function POST(request: Request) {
  let body: UpdatePreferencesBody;

  try {
    body = (await request.json()) as UpdatePreferencesBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = body.userId?.trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (!Array.isArray(body.categories) || body.categories.length === 0) {
    return NextResponse.json({ error: "categories is required." }, { status: 400 });
  }

  const normalizedCategories = body.categories.map((value) => normalizeCategory(value));
  const uniqueCategories = Array.from(new Set(normalizedCategories));
  const mappedCategories = uniqueCategories.map((value) => CATEGORY_MAP[value]).filter(Boolean);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      preference: {
        select: {
          categories: true,
        },
      },
      subscription: {
        select: {
          status: true,
          plan: true,
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

  const expectedCount = PLAN_CATEGORY_COUNT[user.subscription.plan];

  if (!expectedCount) {
    return NextResponse.json({ error: "Unknown subscription plan." }, { status: 400 });
  }

  if (mappedCategories.length !== expectedCount) {
    return NextResponse.json(
      { error: `This plan requires exactly ${expectedCount} theme(s).` },
      { status: 400 },
    );
  }

  const now = new Date();
  const { start, end } = getMonthWindow(now);
  const changesThisMonth = await prisma.preferenceChangeLog.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  if (changesThisMonth >= 3) {
    return NextResponse.json(
      { error: "Theme change limit reached (3 per month)." },
      { status: 429 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.userPreference.update({
        where: { userId },
        data: {
          categories: mappedCategories,
        },
      }),
      prisma.preferenceChangeLog.create({
        data: {
          userId,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to update account preferences.", error);
    return NextResponse.json(
      {
        error:
          "Preferences update is temporarily unavailable. Please contact support or try again later.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    changesUsedThisMonth: changesThisMonth + 1,
    changesRemainingThisMonth: Math.max(0, 3 - (changesThisMonth + 1)),
  });
}
