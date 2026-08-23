import { NextResponse } from "next/server";
import { sendPushNotification, type PushSubscriptionPayload } from "@/lib/server/push";
import { savePushSubscription } from "@/lib/server/pushStore";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys.auth) {
      return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
    }

    const subscriber = await savePushSubscription(body);

    await sendPushNotification(subscriber, {
      type: "TEST_NOTIFICATION",
      title: "این کارته",
      body: "Web Push با موفقیت به دستگاه شما رسید.",
      tag: "inkarete-web-push-test",
    });

    return NextResponse.json({ ok: true, testPushSent: true });
  } catch (error) {
    console.error("Push subscription test failed:", error);
    return NextResponse.json({ error: "Failed to save subscription or send test push" }, { status: 500 });
  }
}
