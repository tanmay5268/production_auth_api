import crypto from "crypto"
import bcrypt from "bcrypt";
import { configuration } from "@/utils/configurations";
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
        const URL = `${configuration.getAuthurl()}/verify?token=${token}`;
        return URL;
    }
    async VerifyUser(email: string, token: string) {
        await Useroperations.verifyUser(email, token);
    }
}
export const AuthService = new AuthFunctions;