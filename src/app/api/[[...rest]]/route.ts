import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { CORSPlugin } from "@orpc/server/plugins";
import { LoggingHandlerPlugin } from '@orpc/experimental-pino'
import pino from 'pino'
import { onError } from "@orpc/server";
import { router } from "@/router";
import { RatelimitHandlerPlugin } from '@orpc/experimental-ratelimit'
import { ratelimiter } from "@/middlewares/ratelimit";

const schemaConverters = [new ZodToJsonSchemaConverter()];
const logger = pino()
const handler = new OpenAPIHandler(router, {
    plugins: [
    // @ts-ignore
    new RatelimitHandlerPlugin(),
        new CORSPlugin(),
        // @ts-ignore
    new LoggingHandlerPlugin({
              logger, // Custom logger instance
              generateId: ({ request }) => crypto.randomUUID(), // Custom ID generator
              logRequestResponse: true, // Log request start/end (disabled by default)
              logRequestAbort: true, // Log when requests are aborted (disabled by default)
            }),
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
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: Request) {
  const resHeaders = new Headers();

  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: {
      headers: request.headers,
        resHeaders,
        ratelimiter,
    },
  });

  if (!response) {
    return new Response("Not found", { status: 404 });
  }
  const setCookieHeaders = resHeaders.getSetCookie();
  if (setCookieHeaders.length > 0) {
    const newHeaders = new Headers(response.headers);
    for (const cookie of setCookieHeaders) {
      newHeaders.append("Set-Cookie", cookie);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
