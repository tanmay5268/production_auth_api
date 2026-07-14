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
    async findbyhash(tokenHash: string): Promise<RefreshToken | null> {
        const Hash = await prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
        return Hash;
    }
    async revoke(id: string, replacedBy?: string) {
        return prisma.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                ...(replacedBy ? { replacedBy } : {}),
            },
        });
    }
    async revokeAllForUser(userId: string) {
        return prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}

export const refreshTokenOperations= new refreshTokenfunction()
