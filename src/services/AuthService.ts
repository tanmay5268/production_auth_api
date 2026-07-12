import crypto from "crypto"
import bcrypt from "bcrypt";
import { env } from "@/utils/configurations"
import { Useroperations } from "@/repository/User.repository";
class AuthFunctions{
    async HashPayload(payload: string): Promise<string> {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(payload, salt);
            return hash;
        } catch (error: any) {
            throw new Error(`Failed to hash password: ${error.message}`);
        }
    }
    GenerateToken(): string {
        const token = crypto.randomBytes(16).toString('hex');
        return token;
    }

    GenerateURL(token:string): string{
        const URL = `${env.AUTH_BASE_URL}/verify?token=${token}`;
        return URL;
    }

    GenerateResetURL(token: string): string {
        const URL = `${env.AUTH_BASE_URL}/reset-password?token=${token}`;
        return URL;
    }
    async VerifyUser(email: string, token: string) {
        await Useroperations.verifyUser(email, token);
    }
    async verifyPassword(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
      }
    
      generateSessionToken(): string {
        return crypto.randomBytes(32).toString('hex'); // 64 chars, high entropy
      }
    
      getSessionExpiry(days = 7): Date {
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
}
export const AuthService = new AuthFunctions;