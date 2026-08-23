import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/server/push";
import { getPushSubscribers, recordPushFailure, recordPushSuccess } from "@/lib/server/pushStore";

export const runtime = "nodejs";

type TestPushResult = {
  total: number;
  attempted: number;
  sent: number;
  skippedDisabled: number;
  invalid: number;
  failed: number;
};

export async function POST() {
  const subscribers = await getPushSubscribers();
  const result: TestPushResult = {
    total: subscribers.length,
    attempted: 0,
    sent: 0,
    skippedDisabled: 0,
    invalid: 0,
    failed: 0,
  };

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

    try {
      await sendPushNotification(
        subscriber,
        {
          type: "TEST",
          title: "این کارته",
          body: "این یک اعلان تستی از پنل مدیریت است.",
        },
        { TTL: 600 },
      );
      await recordPushSuccess(subscriber);
      result.sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      const invalid = statusCode === 404 || statusCode === 410;
      await recordPushFailure(subscriber, invalid);
      if (invalid) result.invalid += 1;
      else result.failed += 1;
      console.error("Test push failed:", error);
    }
  }));

  return NextResponse.json({ ok: true, ...result });
}
