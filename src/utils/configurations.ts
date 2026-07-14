import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    DATABASE_URL: z
        .url()
        .startsWith("postgresql://")
        .nonempty("DATABASE_URL is required"),
    AUTH_BASE_URL: z.url().nonempty("AUTH_BASE_URL is required"),
    MAIL_SERVICE_API_KEY: z
        .string()
        .startsWith("re_")
        .nonempty("MAIL_SERVICE_API_KEY is required"),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL: z.coerce.number().default(900),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
});

export type EnvVariables = z.infer<typeof envSchema>;

function validateEnv(): EnvVariables {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error(
            "Environment variable validation failed:",
            result.error
        );
        process.exit(1);
    }
    return result.data;
}
export const env = validateEnv();
