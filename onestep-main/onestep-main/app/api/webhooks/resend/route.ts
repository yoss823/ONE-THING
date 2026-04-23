import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature = request.headers.get("svix-signature");

  if (!process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "RESEND_WEBHOOK_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Resend signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  return NextResponse.json({
    ok: true,
    status: "scaffold-only",
    receivedBytes: payload.length,
    message:
      "Resend webhook verification and event persistence are not implemented yet. The V1 design expects append-only email_events rows tied to send_queue items.",
  });
}
