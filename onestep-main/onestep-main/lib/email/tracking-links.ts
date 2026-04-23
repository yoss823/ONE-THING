export type TrackingResponse = "done" | "skip";

export function buildTrackingPath(
  userId: string,
  actionId: string,
  response: TrackingResponse,
): string {
  const params = new URLSearchParams({
    userId,
    actionId,
    response,
  });

  return `/api/track?${params.toString()}`;
}

export function buildTrackingUrl(
  appUrl: string,
  userId: string,
  actionId: string,
  response: TrackingResponse,
): string {
  return new URL(
    buildTrackingPath(userId, actionId, response),
    appUrl,
  ).toString();
}
