//all the user related db operations lies here..
import { prisma } from "@/utils/prisma";
import type { User, VerificationToken } from "../../generated/prisma";
import {
    RegisterUserInputType,
    VerifyUserInputType,
    ResetPasswordInputType,
} from "@/schema/auth.schema";

class UserOperations {
    async findbyid(id: string): Promise<User | null> {
        const User = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        return User ? User : null;
    }
    async finduser(email: string): Promise<User | null> {
        const User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return User ? User : null;
    }

    async saveRegistration(
        payload: RegisterUserInputType & { token: string },
    ): Promise<void> {
        // TODO:further refactoring required
        await prisma.$transaction([
            prisma.user.create({
                data: {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    emailVerified: null,
                },
            }),
            prisma.verificationToken.create({
                data: {
                    identifier: payload.email,
                    token: payload.token,
                    expires: new Date(Date.now() + 60 * 60 * 1000), // token expires in 1 hour
                },
            }),
        ]);
    }

    async findTokenDetails(
        paylod: VerifyUserInputType,
    ): Promise<VerificationToken | null> {
        const tokenDetails = await prisma.verificationToken.findUnique({
            where: {
                token: paylod.token,
            },
        });
        return tokenDetails ? tokenDetails : null;
    }
    async makeUserverified(email: string, token: string) {
        const Nowtime = new Date();
        await prisma.$transaction([
            prisma.user.update({
                where: {
                    email,
                },
                data: {
                    emailVerified: Nowtime,
                },
            }),
            prisma.verificationToken.delete({
                where: {
                    token,
                },
            }),
        ]);
    }

    async saveResetToken(identifier: string, token: string): Promise<void> {
        await prisma.verificationToken.create({
            data: {
                identifier,
                token,
                expires: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
    }

    async resetPassword(
        email: string,
        token: string,
        hashedPassword: string,
    ): Promise<void> {
        await prisma.$transaction([
            prisma.user.update({
                where: {
                    email,
                },
                data: {
                    password: hashedPassword,
                },
            }),
            prisma.verificationToken.delete({
                where: {
                    token,
                },
            }),
        ]);
    }

    async findByEmailWithPassword(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                emailVerified: true,
                failedLoginCount: true,
                lockedUntil: true,
            },
        });
    }

    async incrementFailedLogin(userId: string, lockUntil?: Date) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                failedLoginCount: { increment: 1 },
                ...(lockUntil ? { lockedUntil: lockUntil } : {}),
            },
        });
    }

    async resetFailedLogin(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { failedLoginCount: 0, lockedUntil: null },
        });
    }

    async createSession(data: {
        userId: string;
        sessionToken: string;
        expires: Date;
    }) {
        return prisma.session.create({ data });
    }
    async signinjwtsession({
        user,
        sessionToken,
        expires,
    }: {
        user: User;
        sessionToken: string;
        expires: Date;
        }) {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { failedLoginCount: 0, lockedUntil: null },
            }),
            prisma.session.create({
                data: {
                    userId: user.id,
                    sessionToken: sessionToken,
                    expires:expires
                }
            })
        ])
    }
}
export const Useroperations = new UserOperations();
