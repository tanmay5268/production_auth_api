import { configuration } from "@/utils/configurations";
import { implement } from "@orpc/server";
import { contract } from "@/contract/index";
import { UserService } from "@/services/UserService";
import { AuthService } from "@/services/AuthService";
const os = implement(contract);

export const RegisterUser = os.production_auth_api.register.handler(
    async ({ input, errors }) => {
        //business logic goes here
        const { email, name, password } = input;
        const UserExists = await UserService.UserExists({ email });
        if (UserExists) {
            throw errors.BAD_REQUEST({
                data: {
                    field: "Email",
                    issue: "Email Exists in DB",
                },
                message:
                    "You have already registered, try to login or Verify Email",
            });
        }
        const hashedPassword = await AuthService.HashPayload(password );
        const token=AuthService.GenerateToken()
        const hashedToken=await AuthService.HashPayload(token)
        const VERIFICATION_URL: string = AuthService.GenerateURL(token)
        const payload = {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            hashtoken:hashedToken
        }
        await UserService.RegisterUser(payload)
        // save user details and token details to database.
        //send email(resend)
        return {
            statusCode: 201,
            message: "userCreated",
        };
    },
);
