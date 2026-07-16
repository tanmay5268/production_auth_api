import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "node:crypto"
import { env } from "@/utils/configurations"

interface Tokenpayload{
    sub: string,
    email:string | null
}
class Tokenfunctions{
    private jwtsecret = env.ACCESS_TOKEN_SECRET
    private ttl = env.ACCESS_TOKEN_TTL
    private days = env.REFRESH_TOKEN_TTL_DAYS

    signAccessToken(payload: Tokenpayload) {
        return jwt.sign(payload, this.jwtsecret, {
            expiresIn:this.ttl
        })
    }
        verifyAccessToken(token:string) :Tokenpayload {
        return jwt.verify(token, this.jwtsecret) as Tokenpayload
    }
    generateRefreshToken():string {
        return crypto.randomBytes(16).toString('hex')
    }
    async HashToken(payload: string): Promise<string> {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(payload, salt);
            return hash;
        } catch (error: any) {
            throw new Error(`Failed to hash password: ${error.message}`) as unknown as string;
        }
    }
    getRefreshExpiry() {
        return new Date(Date.now() + this.days * 24 * 60 * 60 * 1000)
    }
}
export const TokenService = new Tokenfunctions() 
