import { handleDailyEmailCron } from "@/lib/cron/email-cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleDailyEmailCron(request);
}

export async function POST(request: Request) {
  return handleDailyEmailCron(request);
}
