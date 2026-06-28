import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { CORSPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { createAuthRouter } from "@tanmay5268/auth-core";
import { prisma } from "@/utils/prisma";
import { env } from "@/utils/configurations";

const { router, rateLimitInterceptor } = createAuthRouter({
    db: prisma,
    authBaseUrl: env.AUTH_BASE_URL,
    mailApiKey: env.MAIL_SERVICE_API_KEY,
    fromEmail: "noreply@yourdomain.com",
});

const schemaConverters = [new ZodToJsonSchemaConverter()];

const interceptors: any[] = [];
if (rateLimitInterceptor) interceptors.push(rateLimitInterceptor);
interceptors.push(onError((error) => { console.error(error); }));

const handler = new OpenAPIHandler(router, {
    plugins: [
        new CORSPlugin(),
        new SmartCoercionPlugin({ schemaConverters }),
        new OpenAPIReferencePlugin({
            schemaConverters,
            specGenerateOptions: {
                info: {
                    title: "production-auth-api",
                    version: "1.0.0",
                    description:
                        "Production-grade Tutorial API built with ORPC and Next.js",
                },
                security: [{ bearerAuth: [] }],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: "http",
                            scheme: "bearer",
                        },
                    },
                },
            },
        }),
    ],
    interceptors,
});

async function handleRequest(request: Request) {
    const { response } = await handler.handle(request, {
        prefix: "/api/auth",
        context: { headers: request.headers },
    });

    return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
