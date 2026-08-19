import { Redis } from "@upstash/redis";
import type { PushSubscriptionPayload } from "@/lib/server/push";

const redis = Redis.fromEnv();
const SUBSCRIPTION_KEY = "inkarete:push:subscriptions";

export async function savePushSubscription(subscription: PushSubscriptionPayload): Promise<void> {
  await redis.hset(SUBSCRIPTION_KEY, { [subscription.endpoint]: JSON.stringify(subscription) });
}

export async function getPushSubscriptions(): Promise<PushSubscriptionPayload[]> {
  const values = await redis.hgetall<string>(SUBSCRIPTION_KEY);
  if (!values) return [];
  return Object.values(values).map((value) => JSON.parse(value) as PushSubscriptionPayload);
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  await redis.hdel(SUBSCRIPTION_KEY, endpoint);
}
