import { redis } from "@/lib/redis";

async function main() {

  // 1. Ping
  const pong = await redis.ping();
  console.log("Ping:", pong); // → PONG

  // 2. Set and get a value
  await redis.set("test:key", "hello linkvault", { ex: 60 });
  const val = await redis.get("test:key");
  console.log("Get:", val); // → hello linkvault

  // 3. Cache a slug like the redirect engine will
  await redis.set("link:github", "https://github.com", { ex: 86400 });
  const url = await redis.get("link:github");
  console.log("Slug cache:", url); // → https://github.com

  // 4. Delete it
  await redis.del("test:key", "link:github");
  console.log("Cleanup done");
}

main().catch(console.error);