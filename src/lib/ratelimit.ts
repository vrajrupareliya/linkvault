import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// for link creation: 5 new links per minute per user
export const LinkCreateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "rl:link:create",
});

//for redirect endpoint: 60 redirects per minute per IP

export const RedirectLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "rl:redirect",
});