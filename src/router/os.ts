import { contract } from "@/contract";
import { implement, ORPCError } from "@orpc/server";
import { rateLimitMiddleware, ratelimitertype } from "@/middlewares/ratelimit";
import { TokenService } from "@/services/TokenService";
export const os = implement(contract)
    .$context<{
        headers: Headers;
        resHeaders: Headers;
        ratelimiter?: ratelimitertype;
    }>()
    .use(rateLimitMiddleware);

export const protectedOs = os.use(async ({ context, next }) => {
    const accessToken = context.headers.get("cookie")?.split(";")[0].split("=")[1]
    if (!accessToken) {
        throw new ORPCError("UNAUTHORIZED")
    }
    try {
        const data = TokenService.verifyAccessToken(accessToken)
        console.log(data)
        if (!data) {
            throw new ORPCError("UNAUTHORIZED")
        }
    } catch {
        throw new ORPCError("UNAUTHORIZED")
    }
    return next()
})
