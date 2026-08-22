import { NextResponse } from "next/server";
import { setPushNotificationEnabled } from "@/lib/server/pushStore";

type PreferencePayload = {
  endpoint?: string;
  enabled?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreferencePayload;

    if (!body.endpoint || typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid push preference" }, { status: 400 });
    }

    const updated = await setPushNotificationEnabled(body.endpoint, body.enabled);
    if (!updated) {
      return NextResponse.json({ error: "Push subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push preference update failed:", error);
    return NextResponse.json({ error: "Failed to update push preference" }, { status: 500 });
  }
}
