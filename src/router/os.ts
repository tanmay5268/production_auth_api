import { contract } from "@/contract";
import { implement } from "@orpc/server";
import { MemoryRatelimiter } from "@orpc/experimental-ratelimit/memory";
import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit";
export const ratelimiter = new MemoryRatelimiter({
    maxRequests: 5,
    window: 60_000,
});

export const rateLimitMiddleware = createRatelimitMiddleware({
    limiter: ({ context }) => context.ratelimiter,
    key: ({ context }) => {
        const ip = context.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || context.headers.get("x-real-ip")
            || "unknown";
        console.log("Rate Limiterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
        return `ratelimit:${ip}`;
    },
});

export const os = implement(contract)
    .$context<{
        headers: Headers;
        resHeaders: Headers;
        ratelimiter?: typeof ratelimiter;
    }>()
    .use(rateLimitMiddleware)
