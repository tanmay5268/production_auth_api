import * as contracts from "./auth.contract";
// add all contract in one place 
// hello
export const contract = {
    production_auth_api: {
        register: contracts.RegisterUserContract,
        verify:contracts.VerifyUserContract,
        forgotPassword: contracts.ForgotPasswordContract,
        resetPassword: contracts.ResetPasswordContract,
        loginwithJwtSession: contracts.loginJwtSessionContract,
        loginAccessRefresh: contracts.loginAccessRefresh
    }
}
