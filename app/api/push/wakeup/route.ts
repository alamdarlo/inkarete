import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/server/push";
import { getPushSubscriptions, removePushSubscription } from "@/lib/server/pushStore";

export const runtime = "nodejs";

type WakeupResult = {
  sent: number;
  removed: number;
};

export async function GET(request: Request) {
  const expectedSecret = process.env.PUSH_WAKEUP_SECRET;
  const authorization = request.headers.get("authorization");

  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: WakeupResult = { sent: 0, removed: 0 };
  const subscriptions = await getPushSubscriptions();

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await sendPushNotification(subscription, { type: "WAKE_UP" }, { TTL: 600 });
      result.sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await removePushSubscription(subscription.endpoint);
        result.removed += 1;
        return;
      }

      console.error("Push wake-up failed:", error);
    }
  }));

  return NextResponse.json({ ok: true, ...result });
}
