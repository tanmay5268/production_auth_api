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
        message: "You have exceeded your allowed rate limit",
    },
    UNAUTHORIZED: {
        status: 401,
        message: "Authentication required",
    },
    FORBIDDEN: {
        status: 403,
        message: "You dont have required permissions to perform this action",
        data: z.object({
            reason: z.enum(["Locked", "Unverified"]),
        }),
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
        path: "/auth/register",
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
        path: "/auth/verify/{token}",
        successStatus: 200,
        summary: "Verifying Email",
        description: "Verifying user through generated tokens.",
        tags:["auth"],
    })
    .input(schema.VerifyUserInputSchema)
    .output(schema.VerifyUserOutputSchema);

export const ForgotPasswordContract = base
    .route({
        method: "POST",
        path: "/auth/forgot-password",
        successStatus: 200,
        summary: "Forgot Password",
        description: "Sends a password reset email if the account exists.",
        tags: ["auth"],
    })
    .input(schema.ForgotPasswordInputSchema)
    .output(schema.ForgotPasswordOutputSchema);

export const ResetPasswordContract = base
    .route({
        method: "POST",
        path: "/auth/reset-password",
        successStatus: 200,
        summary: "Reset Password",
        description: "Resets the password using a valid token.",
        tags: ["auth"],
    })
    .input(schema.ResetPasswordInputSchema)
    .output(schema.ResetPasswordOutputSchema);

export const loginJwtSessionContract = base
    .route({
        method: "POST",
        path: "/auth/loginjwtsession",
        successStatus: 200,
        tags: ["auth"],
        description:
            "Session cookie flow (top): every step after login touches the database. The session is a row you look up on every single request. Simple, fully revocable, one moving part.",
        successDescription: "statusCode with Jwt-cookie",
        summary:"jwtsessionlogin"
    })
    .input(schema.loginInputSchema)
    .output(schema.loginOutputSchema);

export const loginAccessRefresh = base.route({
    method: "POST",
    tags:['auth'],
    path: "/auth/login_access_refresh",
    successStatus: 200,
    summary:"refreshAccess flow",
    successDescription:"Acesss token with jwt and refres token with crypto"
})
    .input(schema.loginInputSchema)
    .output(schema.loginOutputSchema);

export const revokeTokenContract = base.route({
    method: "POST",
    tags:['auth'],
    path: "/auth/revokeToken",
    successStatus: 200,
    summary:"Revoke RefreshToken",
    successDescription:"Revoke RefreshToken and remove from database"
}).input(schema.revokeTokenInputSchema).output(schema.revokeTokenOutputSchema);

export const refreshTokenContract = base.route({
    method: "POST",
    tags:['auth'],
    path: "/auth/refreshToken",
    successStatus: 200,
    summary:"Refresh AccessToken",
    successDescription:"Refresh AccessToken using RefreshToken"
}).input(schema.refreshTokenInputSchema).output(schema.refreshTokenOutputSchema);
