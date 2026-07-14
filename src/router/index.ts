import { os } from "./os";
import { RegisterUser, VerifyToken, ForgotPassword, ResetPassword, LoginJwtSession,LoginAccessRefresh } from "./auth";

export const router = os.router({
    production_auth_api: {
        register: RegisterUser,
        verify: VerifyToken,
        forgotPassword: ForgotPassword,
        resetPassword: ResetPassword,
        loginwithJwtSession: LoginJwtSession,
        loginAccessRefresh:LoginAccessRefresh
    }
})