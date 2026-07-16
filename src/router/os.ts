import { contract } from "@/contract";
import { implement } from "@orpc/server";
import { rateLimitMiddleware, ratelimitertype } from "@/middlewares/ratelimit";

export const os = implement(contract)
    .$context<{
        headers: Headers;
        resHeaders: Headers;
        ratelimiter?: ratelimitertype;
    }>()
    .use(rateLimitMiddleware).production_auth_api;

export const protectedOs = os.use(async ({context,next}) => {
    return next()
})
