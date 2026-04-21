import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    status: "scaffold-only",
    message:
      "The process-send-queue worker is not implemented yet. The intended V1 behavior is documented in docs/one-thing-v1-technical-plan.md and lib/cron/send-queue.ts.",
  });
}
