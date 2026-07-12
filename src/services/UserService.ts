import {
    RegisterUserInputType,
    VerifyUserInputType,
    loginInputType,
} from "@/schema/auth.schema";
import { Useroperations } from "@/repository/User.repository";
import { AuthService } from "./AuthService";
import { ORPCError } from "@orpc/client";

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
    async loginjwtsession(payload: loginInputType) {
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
}

export const UserService = new UserFunctions();
