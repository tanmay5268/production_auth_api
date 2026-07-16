import {
    RegisterUserInputType,
    VerifyUserInputType,
    loginInputType,
} from "@/schema/auth.schema";
import { Useroperations } from "@/repository/User.repository";
import { AuthService } from "./AuthService";
import { ORPCError } from "@orpc/client";
import { TokenService } from "./TokenService";
import { refreshTokenOperations } from "@/repository/refresh.repository";
import { error } from "node:console";

class UserFunctions {
    private MAX_ATTEMPTS = 5;
    private LOCK_DURATION_MS = 15 * 60 * 1000;
    async UserExists({
        email,
    }: Pick<RegisterUserInputType, "email">): Promise<Boolean> {
        const User = await Useroperations.finduser(email);
        return !!User;
    }
    async RegisterUser(payload: RegisterUserInputType & { token: string }) {
        await Useroperations.saveRegistration(payload);
    }
    async GetTokenDetails(userToken: VerifyUserInputType) {
        const tokenDetails = await Useroperations.findTokenDetails(userToken);
        return tokenDetails;
    }
    CheckExpiry(timeLimit: Date): boolean {
        const NowTime = new Date();
        return NowTime.getTime() > timeLimit.getTime();
    }
    async SaveResetToken(email: string, token: string) {
        await Useroperations.saveResetToken(email, token);
    }
    async ResetPassword(email: string, token: string, hashedPassword: string) {
        await Useroperations.resetPassword(email, token, hashedPassword);
    }
    async loginjwtsession(payload: loginInputType): Promise<{ sessionToken: string, expires: Date, user: { id:string,name:string|null,email:string|null}}> {
        const user = await Useroperations.finduser(payload.email);
        const DUMMY_HASH =
            "$2b$10$CwTycUXWue0Thq9StjUM0uJ8u2i5c5r5r5r5r5r5r5r5r5r5r5r5C";
        const passwordToCheck = user?.password ?? DUMMY_HASH;
        const isValid = await AuthService.verifyPassword(
            payload.password,
            passwordToCheck,
        );
        if (!user || !isValid) {
            //if user is there but somehow password cant be verified
            if (user) {
                await this.registerFailedAttempt(user);
            }
            throw new ORPCError("UNAUTHORIZED", {
                message: "invalid credentials",
            });
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new ORPCError("FORBIDDEN", {
                message: "Account temporarily locked. Try again later.",
                data: { reason: "LOCKED" },
            });
        }
        if (!user.emailVerified) {
            throw new ORPCError("FORBIDDEN", {
                message: "Please verify your email before logging in.",
                data: { reason: "UNVERIFIED" },
            });
        }
        // this 3 condition are handled
        const sessionToken = AuthService.generateSessionToken();
        const expires = AuthService.getSessionExpiry();
        await Useroperations.signinjwtsession({ user, sessionToken, expires });
        return {
            sessionToken,
            expires,
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
    async registerFailedAttempt(user: {
        id: string;
        failedLoginCount: number;
    }) {
        const newCount = user.failedLoginCount + 1;
        const lockUntil =
            newCount >= this.MAX_ATTEMPTS
                ? new Date(Date.now() + this.LOCK_DURATION_MS)
                : undefined;
        await Useroperations.incrementFailedLogin(user.id, lockUntil);
    }
    async loginAccessRefresh(payload: { input: loginInputType; agent: string|null }) {
        if (!payload.agent) { 
                throw new ORPCError("BAD_REQUEST", { message: "User agent required" });
        }
        console.time("db")
        const user = await Useroperations.finduser(payload.input.email)
        console.timeEnd("db")
        //verify password
        const DUMMY_HASH =
            "$2b$10$CwTycUXWue0Thq9StjUM0uJ8u2i5c5r5r5r5r5r5r5r5r5r5r5r5C";
        const passwordToCheck = user?.password ?? DUMMY_HASH;
        const isValid = await AuthService.verifyPassword(
            payload.input.password,
            passwordToCheck,
        );
        if (!user || !isValid) {
            //if user is there but somehow password cant be verified
            if (user) {
                await this.registerFailedAttempt(user);
            }
            throw new ORPCError("UNAUTHORIZED", {
                message: "invalid credentials",
            });
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new ORPCError("FORBIDDEN", {
                message: "Account temporarily locked. Try again later.",
                data: { reason: "LOCKED" },
            });
        }
        if (!user.emailVerified) {
            throw new ORPCError("FORBIDDEN", {
                message: "Please verify your email before logging in.",
                data: { reason: "UNVERIFIED" },
            });
        }
        //create Assess token
        const accessToken = TokenService.signAccessToken({
            sub: user.id,
            email: user.email
        })
        const rawrefreshToken = TokenService.generateRefreshToken()
        // create Refresh token
        
        const refreshToken=await refreshTokenOperations.create({
            tokenHash: rawrefreshToken,
            userAgent: payload.agent,
            userId: user.id,
            createdAt: new Date(),
            expiresAt:TokenService.getRefreshExpiry()
        })
        
        return {
            accessToken: accessToken,
            refreshToken: rawrefreshToken,
            expires:refreshToken.expiresAt,
            user: { id: user.id, name: user.name, email: user.email },
        }
    }
    async revokeRefreshToken(token: string) {
        const revoked = await  refreshTokenOperations.revoke(token);
        if (!revoked) {
            throw new ORPCError("NOT_FOUND",{
                data:{
                    reason:"Refresh token not found or already revoked",
                    issue:"The provided refresh token does not exist in the database or has already been revoked."
                }                
            });
        }
        return revoked;
    }
    async refreshAccessToken(refreshToken: string) {
        const tokenRecord = await refreshTokenOperations.findRefreshToken(refreshToken);
        if (!tokenRecord || tokenRecord.revokedAt) {
            throw new ORPCError("UNAUTHORIZED", {
                message: "Invalid or revoked refresh token",
            });
        }
        if (tokenRecord.expiresAt < new Date()) {
            throw new ORPCError("UNAUTHORIZED", {
                message: "Refresh token has expired",
            });
        }
        const user = await Useroperations.findbyid(tokenRecord.userId);
        if (!user) {
            throw new ORPCError("UNAUTHORIZED", {
                message: "User associated with the refresh token not found",
            });
        }
        const accessToken = TokenService.signAccessToken({
            sub: user.id,
            email: user.email
        });
        return {
            accessToken,
            user: { id: user.id, name: user.name, email: user.email },
        };
    }
}

export const UserService = new UserFunctions();
