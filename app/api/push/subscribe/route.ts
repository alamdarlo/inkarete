import { NextResponse } from "next/server";
import { sendPushNotification, type PushSubscriptionPayload } from "@/lib/server/push";
import { removePushSubscription, savePushSubscription } from "@/lib/server/pushStore";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys.auth) {
      return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
    }

    await savePushSubscription(body);

    try {
      await sendPushNotification(body, {
        type: "TEST_NOTIFICATION",
        title: "این کارته",
        body: "Web Push با موفقیت به دستگاه شما رسید.",
        tag: "inkarete-web-push-test",
      });
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 404 || statusCode === 410) {
        await removePushSubscription(body.endpoint);
        return NextResponse.json({ error: "Push subscription is no longer valid" }, { status: 410 });
      }

      throw error;
    }

    return NextResponse.json({ ok: true, testPushSent: true });
  } catch (error) {
    console.error("Push subscription test failed:", error);
    return NextResponse.json({ error: "Failed to save subscription or send test push" }, { status: 500 });
  }
}
