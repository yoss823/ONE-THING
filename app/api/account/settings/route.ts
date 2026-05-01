import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { isSiteLocale } from "@/lib/i18n/locale";
import { isValidIanaTimezone } from "@/lib/timezone/iana";

type UpdateSettingsBody = {
  userId?: string;
  energyLevel?: number;
  availableMinutes?: number;
  locale?: string;
  timezone?: string;
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

  if (body.locale !== undefined && !isSiteLocale(body.locale)) {
    return NextResponse.json({ error: "locale must be en, fr, or es." }, { status: 400 });
  }

  if (body.timezone !== undefined) {
    const tz = typeof body.timezone === "string" ? body.timezone.trim() : "";
    if (!tz || !isValidIanaTimezone(tz)) {
      return NextResponse.json({ error: "timezone must be a valid IANA name (e.g. Europe/Paris)." }, { status: 400 });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      timezone: true,
      subscription: {
        select: {
          status: true,
        },
      },
      preference: {
        select: {
          energyLevel: true,
          availableMinutes: true,
          locale: true,
        },
      },
    },
  });

  if (!user || !user.preference || !user.subscription) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (!["active", "trialing", "past_due"].includes(user.subscription.status.toLowerCase())) {
    return NextResponse.json({ error: "Subscription is not active." }, { status: 403 });
  }

  const resolvedEnergy =
    Number.isInteger(body.energyLevel) &&
    (body.energyLevel ?? 0) >= 1 &&
    (body.energyLevel ?? 0) <= 3
      ? body.energyLevel!
      : user.preference.energyLevel;

  const resolvedMinutes =
    Number.isInteger(body.availableMinutes) && [5, 10, 15].includes(body.availableMinutes ?? 0)
      ? body.availableMinutes!
      : user.preference.availableMinutes;

  const resolvedLocale =
    body.locale !== undefined && isSiteLocale(body.locale)
      ? body.locale
      : (user.preference.locale ?? "en");

  const resolvedTimezone =
    body.timezone !== undefined && typeof body.timezone === "string" && isValidIanaTimezone(body.timezone)
      ? body.timezone.trim()
      : (user.timezone?.trim() || "UTC");

  try {
    await prisma.$transaction([
      prisma.userPreference.update({
        where: { userId },
        data: {
          energyLevel: resolvedEnergy,
          availableMinutes: resolvedMinutes,
          locale: resolvedLocale,
        },
      }),
      ...(body.timezone !== undefined
        ? [
            prisma.user.update({
              where: { id: userId },
              data: { timezone: resolvedTimezone },
            }),
          ]
        : []),
    ]);
  } catch (error) {
    console.error("Failed to update account settings.", error);
    return NextResponse.json(
      { error: "Settings update is temporarily unavailable." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    energyLevel: resolvedEnergy,
    availableMinutes: resolvedMinutes,
    locale: resolvedLocale,
    timezone: resolvedTimezone,
  });
}
