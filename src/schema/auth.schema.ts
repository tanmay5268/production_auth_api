import { email, z } from "zod";
import { UserSchema } from "./db_tables.schema";

//input schemas -----------------------------------------------------
export const RegisterUserInputSchema = UserSchema.pick({
    name: true,
    email: true,
    password: true,
});

//output schemas ---------------------------------------------------
export const RegisterUserOutputSchema = z.object({
    message: z.string(),
    statusCode: z.number().int(),
});
