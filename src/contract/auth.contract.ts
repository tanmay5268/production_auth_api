import { oc } from "@orpc/contract";
import * as z from "zod";
import * as schema from "@/schema/auth.schema";
export const base = oc.errors({
    BAD_REQUEST: {
        status: 400,
        message: "Invalid request data",
        data: z.object({
            field: z.string().min(3),
            issue: z.string().min(3),
        }),
    },
    TOO_MANY_REQUESTS: {
        status: 429,
        message:
            "You have exceeded your allowed rate limit of 100 requests per minute.",
    },
    UNAUTHORIZED: {
        status: 401,
        message: "Authentication required",
    },
    FORBIDDEN: {
        status: 403,
        message: "You dont have required permissions to perform this action",
    },
    NOT_FOUND: {
        status: 404,
        message: "Resource not found",
        data: z.object({
            resource: z.string(),
            issue: z.string(),
        }),
    },
    CONFLICT: {
        status: 409,
        message: "Resource conflict",
        data: z.object({
            field: z.string(),
            value: z.string().nullable(),
        }),
    },
    INTERNAL_SERVER_ERROR: {
        status: 500,
        message: "An unexpected error occurred",
        data: z.object({
            errorId: z.string().optional(),
            details: z.string(),
        }),
    },
    DOMAIN_RULE_VIOLATION: {
        status: 422,
        message: "Business rule violation",
        data: z.object({
            rule: z.string(),
        }),
    },
});

export const RegisterUserContract = base
    .route({
        method: "POST",
        path: "/api/auth/register",
        successStatus: 201,
        summary: "New User creation",
        description:
            "Creating user and populating User Table, email is not verified at this point",
        tags: ["auth"],
    })
    .input(schema.RegisterUserInputSchema)
    .output(schema.RegisterUserOutputSchema);

export const VerifyUserContract = base
    .route({
        method: "POST",
        path: "/api/auth/verify/{token}",
        successStatus: 200,
        summary: "Verifying Email",
        description: "Verifying user through generated tokens.",
        tags:["auth"],
    })
    .input(schema.VerifyUserInputSchema)
    .output(schema.VerifyUserOutputSchema);
