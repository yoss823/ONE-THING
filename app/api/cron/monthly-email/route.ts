import { handleMonthlyClarityEmailCron } from "@/lib/cron/email-cron";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleMonthlyClarityEmailCron(request);
}
