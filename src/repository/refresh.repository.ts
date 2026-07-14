import { prisma } from "@/utils/prisma";
import type { RefreshToken } from "../../generated/prisma";
class refreshTokenfunction {
    async create(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
        userAgent: string;
        createdAt: Date;
    }) {
        return prisma.refreshToken.create({ data });
    }
    async findRefreshToken(token: string): Promise<RefreshToken | null> {
        const Hash = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: token,
            },
        });
        return Hash;
    }
    async revoke(token: string): Promise<RefreshToken> {
        const deletedToken = await prisma.refreshToken.delete({
            where:{
                tokenHash: token
            }
        });
        return deletedToken;
    }
    async revokeAllForUser(userId: string) {
        return prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}

export const refreshTokenOperations= new refreshTokenfunction()
