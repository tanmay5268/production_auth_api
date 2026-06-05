import { RegisterUserInputType } from "@/schema/auth.schema";
import { operation } from "@/repository/User.repository";

class UserFunctions {
    async UserExists({
        email,
    }: Pick<RegisterUserInputType, "email">): Promise<Boolean> {
        const User = await operation.finduser(email);
        return !!User;
    }
    async RegisterUser(payload: RegisterUserInputType & { hashtoken: string }) {
        await operation.saveRegistration(payload)
    }
}

export const UserService = new UserFunctions();
