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
}

export const UserService = new UserFunctions();
