export type TrackingAction = "done" | "pause";

export function buildTrackingPath(
  token: string,
  action: TrackingAction,
): string {
  return `/t/${token}/${action}`;
}

export function buildTrackingUrl(
  appUrl: string,
  token: string,
  action: TrackingAction,
): string {
  return new URL(buildTrackingPath(token, action), appUrl).toString();
}
