import { oc } from "@orpc/contract";
import * as z from "zod";
import {
    RegisterUserOutputSchema,
    RegisterUserInputSchema,
} from "@/schema/auth.schema";
export const base = oc.errors({
    BAD_REQUEST: {
        status: 400,
        message: "Invalid request data",
        data: z.object({
            field: z.string().min(3),
            issue: z.string().min(3),
        })
    },
    TOO_MANY_REQUESTS: {
        status: 429,
        message: "You have exceeded your allowed rate limit of 100 requests per minute.",
    },
    UNAUTHORIZED: {
        status: 401,
        message: "Authentication required",
    },
    FORBIDDEN: {
        status: 403,
        message: "You must have permission to perform this action",
    },
    NOT_FOUND: {
        status: 404,
        message: "Resource not found",
        data: z.object({
            resourceType: z.string(),
            resourceId: z.string(),
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
        tags:["auth"]
    })
    .input(RegisterUserInputSchema)
    .output(RegisterUserOutputSchema);
