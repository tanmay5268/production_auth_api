import { prisma } from "@/utils/prisma";

const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
const VERIFICATION_TOKEN_TTL_MS = MILLISECONDS_IN_HOUR;

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
