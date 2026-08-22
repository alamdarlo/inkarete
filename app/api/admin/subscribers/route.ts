import { NextResponse } from "next/server";
import { getPushSubscribers } from "@/lib/server/pushStore";

export const runtime = "nodejs";

export async function GET() {
  const subscribers = await getPushSubscribers();

  return NextResponse.json({
    subscribers: subscribers.map((subscriber) => ({
      endpoint: subscriber.endpoint,
      notificationEnabled: subscriber.notificationEnabled,
      subscriptionStatus: subscriber.subscriptionStatus,
      createdAt: subscriber.createdAt,
      lastSeenAt: subscriber.lastSeenAt,
      lastPushAt: subscriber.lastPushAt ?? null,
      lastPushSuccessAt: subscriber.lastPushSuccessAt ?? null,
      lastPushFailureAt: subscriber.lastPushFailureAt ?? null,
    })),
  });
}
