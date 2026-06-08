import { configuration } from "@/utils/configurations";
import { implement } from "@orpc/server";
import { contract } from "@/contract/index";
import { UserService } from "@/services/UserService";
import { AuthService } from "@/services/AuthService";
import { EmailService } from "@/services/EmailService";
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
        const hashedPassword = await AuthService.HashPayload(password);
        const token = AuthService.GenerateToken();
        const VERIFICATION_URL: string = AuthService.GenerateURL(token);
        console.log(VERIFICATION_URL);
        const payload = {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            token: token,
        };
        await UserService.RegisterUser(payload);
        // save user details and token details to database.
        //send email(resend)
        const response = await EmailService.sendMail({
            email,
            VERIFICATION_URL,
            username: name,
        });
        if (response.error)
            throw errors.INTERNAL_SERVER_ERROR({
                data: {
                    details: "Failed to send verification email",
                },
            });
        return {
            statusCode: 201,
            message: "userCreated",
        };
    },
);

export const VerifyToken = os.production_auth_api.verify.handler(
    async ({ input, errors }) => {
        //extract token
        // find token in db get all details
        const tokenDetails = await UserService.GetTokenDetails(input);
        if (!tokenDetails) {
            throw errors.NOT_FOUND({
                data: {
                    resource: "tokenDetails",
                    issue: "token details not found in database",
                },
            });
        }
        const timeLimit = tokenDetails.expires;
        const isExpired = UserService.CheckExpiry(timeLimit);
        if (isExpired) {
            throw errors.BAD_REQUEST({
                data: {
                    field: "token",
                    issue: "Token has expired",
                },
            });
        }
        // find the email in user db and mak it verified && delete token from tokendb
        await AuthService.VerifyUser(tokenDetails.identifier, tokenDetails.token);
        // succes
        return {
            identifier: tokenDetails.identifier,
            statusCode: 200,
            message: "User verified",
        };
    },
);
