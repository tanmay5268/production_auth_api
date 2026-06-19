import {
    RegisterUserInputType,
    VerifyUserInputType,
} from "@/schema/auth.schema";
import { Useroperations } from "@/repository/User.repository";

class UserFunctions {
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
}

export const UserService = new UserFunctions();
