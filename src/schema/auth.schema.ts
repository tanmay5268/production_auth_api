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
