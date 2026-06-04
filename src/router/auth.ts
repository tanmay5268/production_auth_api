import { implement } from "@orpc/server";
import { contract } from "@/contract/index";
const os = implement(contract);

export const RegisterUser = os.production_auth_api.register.handler(
    ({ input }) => {
        //business logic goes here
        return {
            statusCode: 201,
            message: "userCreated",
        };
    },
);
