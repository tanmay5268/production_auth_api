import { z } from "zod";
import { UserSchema, VerificationTokenSchema } from "./db_tables.schema";

//input schemas -----------------------------------------------------
export const RegisterUserInputSchema = UserSchema.pick({
    name: true,
    email: true,
    password: true,
});
export type RegisterUserInputType = z.infer<typeof RegisterUserInputSchema>;
//output schemas ---------------------------------------------------
export const RegisterUserOutputSchema = z.object({
    message: z.string(),
    statusCode: z.number().int(),
});

export const VerifyUserInputSchema = VerificationTokenSchema.pick({
    token: true,
});
export type VerifyUserInputType = z.infer<typeof VerifyUserInputSchema>

export const VerifyUserOutputSchema = z.object({
    message: z.string(),
    statusCode: z.number().int(),
    identifier:z.email()
})

export const ForgotPasswordInputSchema = z.object({
    email: z.string().email(),
});
export type ForgotPasswordInputType = z.infer<typeof ForgotPasswordInputSchema>;

export const ForgotPasswordOutputSchema = z.object({
    message: z.string(),
    statusCode: z.number().int(),
});

export const ResetPasswordInputSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
});
export type ResetPasswordInputType = z.infer<typeof ResetPasswordInputSchema>;

export const ResetPasswordOutputSchema = z.object({
    message: z.string(),
    statusCode: z.number().int(),
});

export const loginInputSchema = RegisterUserInputSchema.pick({
    email: true,
    password:true
})
export type loginInputType= z.infer<typeof loginInputSchema>

export const loginOutputSchema = z.object({
  statusCode: z.literal(200),
  message: z.literal('Login successful'),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
  }),
  // sessionToken is NOT returned in the body — it's set via httpOnly cookie.
});