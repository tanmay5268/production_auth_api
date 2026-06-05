//all the user related db operations lies here..
import { prisma } from "@/utils/prisma";
import type { User } from "../../generated/prisma";
import { RegisterUserInputType } from "@/schema/auth.schema";
class UserOperations {
    async finduser(email: string): Promise<User | null> {
        const User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return User ? User : null;
    }
    async saveRegistration(
        payload: RegisterUserInputType & { hashtoken: string },
    ): Promise<void> {
        // TODO:further refactoring required 
        await prisma.$transaction(
            [
                prisma.user.create({
                    data: {
                        name: payload.name,
                        email: payload.email,
                        password: payload.password,
                        emailVerified:null
                    }
                }),
                prisma.verificationToken.create({
                    data: {
                        identifier: payload.email,
                        token: payload.hashtoken,
                        expires: new Date(Date.now() + 60 * 60 * 1000) // token expires in 1 hour
                    }
                })
            ]);
    }
}
export const operation = new UserOperations();
