import {
  DailyDeliveryType,
  Prisma,
  UserEventType,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type TrackingResponse = "done" | "skip";

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function redirectToTracked(
  request: NextRequest,
  response: TrackingResponse,
): NextResponse {
  return NextResponse.redirect(
    new URL(`/tracked?response=${response}`, request.url),
  );
}

function getDeliveryStatus(
  response: TrackingResponse,
): Prisma.DailyDeliveryStatus {
  return response === "done"
    ? Prisma.DailyDeliveryStatus.COMPLETED
    : Prisma.DailyDeliveryStatus.SKIPPED;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const actionId = request.nextUrl.searchParams.get("actionId");
    const response = request.nextUrl.searchParams.get("response");

    if (!userId || !actionId || !response) {
      return redirectTo(request, "/");
    }

    if (response !== "done" && response !== "skip") {
      return redirectTo(request, "/");
    }

    const [user, action] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      prisma.action.findUnique({
        where: { id: actionId },
        select: { id: true },
      }),
    ]);

    if (!user || !action) {
      return redirectTo(request, "/");
    }

    const now = new Date();
    const matchingDeliveryLog = await prisma.dailyDeliveryLog.findFirst({
      where: {
        userId,
        actionId,
        type: DailyDeliveryType.DAILY,
      },
      orderBy: {
        sentAt: "desc",
      },
      select: {
        id: true,
      },
    });

    await prisma.$transaction([
      prisma.userEvent.create({
        data: {
          userId,
          actionId,
          eventType:
            response === "done"
              ? UserEventType.CLICKED_YES
              : UserEventType.CLICKED_PAUSE,
          createdAt: now,
        },
      }),
      ...(matchingDeliveryLog
        ? [
            prisma.dailyDeliveryLog.update({
              where: {
                id: matchingDeliveryLog.id,
              },
              data: {
                status: getDeliveryStatus(response),
                respondedAt: now,
              },
            }),
          ]
        : []),
    ]);

    return redirectToTracked(request, response);
  } catch {
    return redirectTo(request, "/");
  }
}
