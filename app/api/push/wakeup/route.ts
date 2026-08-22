import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/server/push";
import {
  getPushSubscribers,
  markPushAttempt,
  markPushFailure,
  markPushSuccess,
} from "@/lib/server/pushStore";

export const runtime = "nodejs";

type WakeupResult = {
  attempted: number;
  sent: number;
  skippedDisabled: number;
  invalid: number;
};

export async function GET(request: Request) {
  const expectedSecret = process.env.PUSH_WAKEUP_SECRET;
  const authorization = request.headers.get("authorization");

  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: WakeupResult = { attempted: 0, sent: 0, skippedDisabled: 0, invalid: 0 };
  const subscribers = await getPushSubscribers();

  await Promise.all(subscribers.map(async (subscriber) => {
    if (!subscriber.notificationEnabled) {
      result.skippedDisabled += 1;
      return;
    }

    if (subscriber.subscriptionStatus === "invalid") {
      result.invalid += 1;
      return;
    }

    result.attempted += 1;
    await markPushAttempt(subscriber.endpoint);

    try {
      await sendPushNotification(subscriber, { type: "WAKE_UP" }, { TTL: 600 });
      await markPushSuccess(subscriber.endpoint);
      result.sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      const invalid = statusCode === 404 || statusCode === 410;
      await markPushFailure(subscriber.endpoint, invalid);
      if (invalid) result.invalid += 1;
      console.error("Push wake-up failed:", error);
    }
  }));

  return NextResponse.json({ ok: true, ...result });
}
