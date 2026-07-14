import { os } from "./os";
import { UserService } from "@/services/UserService";
import { AuthService } from "@/services/AuthService";
import { EmailService } from "@/services/EmailService";
import { Useroperations } from "@/repository/User.repository";

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
        console.log(isExpired);
        if (isExpired) {
            throw errors.BAD_REQUEST({
                data: {
                    field: "token",
                    issue: "Token has expired",
                },
            });
        }
        // find the email in user db and mak it verified && delete token from tokendb
        await AuthService.makeUserverified(tokenDetails.identifier, tokenDetails.token);
        // succes
        return {
            identifier: tokenDetails.identifier,
            statusCode: 200,
            message: "User verified",
        };
    },
);

export const ForgotPassword = os.production_auth_api.forgotPassword.handler(
    async ({ input, errors }) => {
        const { email } = input;
        const userExists = await UserService.UserExists({ email });
        if (!userExists) {
            return {
                statusCode: 200,
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            };
        }
        const token = AuthService.GenerateToken();
        const RESET_URL: string = AuthService.GenerateResetURL(token);
        await UserService.SaveResetToken(email, token);
        const response = await EmailService.sendResetPasswordMail({
            email,
            RESET_URL,
            username: email.split("@")[0],
        });
        if (response.error)
            throw errors.INTERNAL_SERVER_ERROR({
                data: {
                    details: "Failed to send reset password email",
                },
            });
        return {
            statusCode: 200,
            message:
                "If an account with that email exists, a password reset link has been sent.",
        };
    },
);

export const ResetPassword = os.production_auth_api.resetPassword.handler(
    async ({ input, errors }) => {
        const { token, password } = input;
        const tokenDetails = await UserService.GetTokenDetails({ token });
        if (!tokenDetails) {
            throw errors.NOT_FOUND({
                data: {
                    resource: "token",
                    issue: "Reset token not found in database",
                },
            });
        }
        const isExpired = UserService.CheckExpiry(tokenDetails.expires);
        if (isExpired) {
            throw errors.BAD_REQUEST({
                data: {
                    field: "token",
                    issue: "Token has expired",
                },
            });
        }
        const hashedPassword = await AuthService.HashPayload(password);
        await UserService.ResetPassword(
            tokenDetails.identifier,
            token,
            hashedPassword,
        );
        return {
            statusCode: 200,
            message: "Password has been reset successfully.",
        };
    },
);

export const LoginJwtSession = os.production_auth_api.loginwithJwtSession.handler(
    async ({ input, context, errors }) => {
    const result = await UserService.loginjwtsession({
      email: input.email,
      password: input.password,
    });
  
  // Set httpOnly session cookie via response headers
  context.resHeaders.append(
    "Set-Cookie",
    [
      `session_token=${result.sessionToken}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      `Expires=${result.expires.toUTCString()}`,
    ].join("; ")
  );

  return {
    statusCode: 200 ,
    message: "Login successful",
    user: result.user,
  };
});

export const LoginAccessRefresh = os.production_auth_api.loginAccessRefresh.handler(async ({ context, input }) => {
    const agent = context.headers.get("user-agent")
    const payload = {
        input: input,
        agent:agent
    }
    const result = await UserService.loginAccessRefresh(payload)
    // Two separate Set-Cookie headers
    context.resHeaders.append("Set-Cookie", [
        `refreshToken=${result.refreshToken}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        `Expires=${result.expires.toUTCString()}`,
    ].join("; "));
    
    context.resHeaders.append("Set-Cookie", [
        `accessToken=${result.accessToken}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        `Expires=${result.expires.toUTCString()}`,
    ].join("; "));
    return {
      statusCode: 200 ,
      message: "Login successful",
      user: result.user,
    };
})