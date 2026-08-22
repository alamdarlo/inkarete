import { Redis } from "@upstash/redis";
import type { PushSubscriptionPayload } from "@/lib/server/push";

const redis = Redis.fromEnv();
const SUBSCRIPTION_KEY = "inkarete:push:subscriptions";

type SubscriptionStatus = "active" | "unknown" | "invalid";

export type PushSubscriber = PushSubscriptionPayload & {
  notificationEnabled: boolean;
  subscriptionStatus: SubscriptionStatus;
  createdAt: number;
  lastSeenAt: number;
  lastPushAt?: number;
  lastPushSuccessAt?: number;
  lastPushFailureAt?: number;
};

type StoredSubscriptions = Record<string, string>;

function normalizeSubscriber(subscription: PushSubscriptionPayload | PushSubscriber): PushSubscriber {
  const value = subscription as Partial<PushSubscriber>;
  const now = Date.now();

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: subscription.keys,
    notificationEnabled: value.notificationEnabled ?? true,
    subscriptionStatus: value.subscriptionStatus ?? "active",
    createdAt: value.createdAt ?? now,
    lastSeenAt: value.lastSeenAt ?? now,
    ...(value.lastPushAt ? { lastPushAt: value.lastPushAt } : {}),
    ...(value.lastPushSuccessAt ? { lastPushSuccessAt: value.lastPushSuccessAt } : {}),
    ...(value.lastPushFailureAt ? { lastPushFailureAt: value.lastPushFailureAt } : {}),
  };
}

async function saveSubscriber(subscriber: PushSubscriber): Promise<void> {
  await redis.hset(SUBSCRIPTION_KEY, { [subscriber.endpoint]: JSON.stringify(subscriber) });
}

export async function savePushSubscription(subscription: PushSubscriptionPayload): Promise<PushSubscriber> {
  const existing = await redis.hget<string>(SUBSCRIPTION_KEY, subscription.endpoint);
  const current = existing ? (JSON.parse(existing) as PushSubscriber) : undefined;
  const now = Date.now();

  const subscriber = normalizeSubscriber({
    ...subscription,
    ...(current ? {
      notificationEnabled: current.notificationEnabled,
      createdAt: current.createdAt,
    } : {}),
    subscriptionStatus: "active",
    lastSeenAt: now,
  });

  await saveSubscriber(subscriber);
  return subscriber;
}

export async function getPushSubscribers(): Promise<PushSubscriber[]> {
  const values = await redis.hgetall<StoredSubscriptions>(SUBSCRIPTION_KEY);
  if (!values) return [];

  return Object.values(values).map((value) => normalizeSubscriber(JSON.parse(value) as PushSubscriber));
}

export async function getPushSubscriberCount(): Promise<number> {
  return redis.hlen(SUBSCRIPTION_KEY);
}

export async function getPushSubscriber(endpoint: string): Promise<PushSubscriber | null> {
  const value = await redis.hget<string>(SUBSCRIPTION_KEY, endpoint);
  if (!value) return null;
  return normalizeSubscriber(JSON.parse(value) as PushSubscriber);
}

export async function setPushNotificationEnabled(endpoint: string, enabled: boolean): Promise<boolean> {
  const subscriber = await getPushSubscriber(endpoint);
  if (!subscriber) return false;

  subscriber.notificationEnabled = enabled;
  subscriber.lastSeenAt = Date.now();
  await saveSubscriber(subscriber);
  return true;
}

export async function recordPushSuccess(subscriber: PushSubscriber): Promise<void> {
  const now = Date.now();
  subscriber.subscriptionStatus = "active";
  subscriber.lastPushAt = now;
  subscriber.lastPushSuccessAt = now;
  await saveSubscriber(subscriber);
}

export async function recordPushFailure(subscriber: PushSubscriber, invalid: boolean): Promise<void> {
  const now = Date.now();
  subscriber.subscriptionStatus = invalid ? "invalid" : "unknown";
  subscriber.lastPushAt = now;
  subscriber.lastPushFailureAt = now;
  await saveSubscriber(subscriber);
}
