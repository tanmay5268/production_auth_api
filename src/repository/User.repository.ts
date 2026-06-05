import { prisma } from "@/utils/prisma";

const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60;

type CreateVerificationTokenInput = {
    identifier: string;
    token: string;
    expires?: Date;
};

export const createVerificationToken = ({
    identifier,
    token,
    expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
}: CreateVerificationTokenInput) => {
    return prisma.verificationToken.create({
        data: {
            identifier,
            token,
            expires,
        },
    });
};
