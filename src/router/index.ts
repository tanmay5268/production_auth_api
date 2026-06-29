import { contract } from "@/contract";
import { implement } from "@orpc/server";
import { RegisterUser, VerifyToken, ForgotPassword, ResetPassword } from "./auth";

const os = implement(contract)

export const router = os.router({
    production_auth_api: {
        register: RegisterUser,
        verify: VerifyToken,
        forgotPassword: ForgotPassword,
        resetPassword: ResetPassword,
    }
})