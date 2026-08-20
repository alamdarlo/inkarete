import webpush from "web-push";

let configured = false;

function configureWebPush(): void {
  if (configured) return;

  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error("VAPID environment variables are not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function sendPushNotification(
  subscription: PushSubscriptionPayload,
  payload: Record<string, unknown>,
  options?: webpush.RequestOptions,
): Promise<void> {
  configureWebPush();
  await webpush.sendNotification(subscription, JSON.stringify(payload), options);
}
