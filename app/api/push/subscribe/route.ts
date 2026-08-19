import { NextResponse } from "next/server";
import { sendPushNotification, type PushSubscriptionPayload } from "@/lib/server/push";

let subscription: PushSubscriptionPayload | null = null;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys.auth) {
      return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
    }

    subscription = body;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ subscribed: Boolean(subscription) });
}

export { subscription };
