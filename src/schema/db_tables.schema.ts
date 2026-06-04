import * as z from "zod";
import type {
  Account,
  Authenticator,
  Session,
  User,
  VerificationToken,
} from "../../generated/prisma";


export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.email().nullable(),
  password: z.string().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
}) satisfies z.ZodType<User>;

export const AccountSchema: z.ZodType<Account> = z.object({
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
});

export const SessionSchema: z.ZodType<Session> = z.object({
  id: z.string(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
});

export const VerificationTokenSchema: z.ZodType<VerificationToken> = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
});

export const AuthenticatorSchema: z.ZodType<Authenticator> = z.object({
  id: z.string(),
  credentialID: z.string(),
  userId: z.string(),
  providerAccountId: z.string(),
  credentialPublicKey: z.string(),
  counter: z.number().int(),
  credentialDeviceType: z.string(),
  credentialBackedUp: z.boolean(),
  transports: z.string().nullable(),
});

