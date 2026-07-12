# production-auth-api

## Project Overview

A production-grade authentication API built with Next.js 16 (App Router), ORPC 1.14.4 (type-safe RPC/OpenAPI framework), Prisma 7.8 (ORM), PostgreSQL (hosted on Neon), Zod 4 (validation), Resend (email delivery), and React Email (email templates).

It provides four auth endpoints: **register**, **verify email**, **forgot password**, and **reset password**.

---

## Directory Structure

```
/
├── prisma/
│   ├── schema.prisma                        # DB schema (6 models)
│   └── migrations/                          # SQL migrations
│       ├── 20260604193738_init/migration.sql
│       └── 20260605203423_token_db_primarykey/migration.sql
├── src/
│   ├── app/
│   │   ├── route.ts                         # Health check (GET /)
│   │   └── api/auth/[[...rest]]/route.ts   # ORPC OpenAPI catch-all handler
│   ├── contract/
│   │   ├── index.ts                         # Aggregates contracts under `production_auth_api`
│   │   └── auth.contract.ts                 # 4 ORPC API contracts + typed errors
│   ├── emails/
│   │   ├── VerificationEmail.tsx            # React Email template for email verification
│   │   └── ResetPasswordEmail.tsx           # React Email template for password reset
│   ├── repository/
│   │   └── User.repository.ts              # Prisma DB operations (class UserOperations)
│   ├── router/
│   │   ├── index.ts                         # Aggregates ORPC handlers into router
│   │   └── auth.ts                          # Handler implementations for all 4 endpoints
│   ├── schema/
│   │   ├── auth.schema.ts                   # Zod schemas for API input/output
│   │   └── db_tables.schema.ts             # Zod schemas mirroring DB tables
│   ├── services/
│   │   ├── AuthService.ts                   # Hashing, token gen, URL gen
│   │   ├── EmailService.ts                  # Resend email sending
│   │   └── UserService.ts                   # Business logic wrapping User.repository
│   └── utils/
│       ├── configurations.ts                # Env var validation with Zod
│       └── prisma/index.ts                  # PrismaClient singleton with PrismaPg adapter
├── generated/prisma/                        # Generated Prisma client (gitignored)
│   └── index.d.ts, index.js, ...
├── .env                                     # DATABASE_URL, AUTH_BASE_URL, MAIL_SERVICE_API_KEY
├── package.json                             # Scripts: dev, build, start
├── next.config.ts                           # Next.js config (default)
├── tsconfig.json                            # Strict TS, @/* -> ./src/*
├── prisma.config.ts                         # Prisma config (schema, migrations, datasource)
├── pnpm-workspace.yaml                      # pnpm workspace settings (bcrypt, esbuild, sharp)
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.7 |
| RPC/API | ORPC (contract, server, openapi, client, zod) | 1.14.4 |
| ORM | Prisma (client + adapter-pg) | 7.8.0 |
| Database | PostgreSQL (via Neon) | - |
| Validation | Zod | 4.4.3 |
| Password Hashing | bcrypt | 6.0.0 |
| Email | Resend | 6.12.4 |
| Email Templates | React Email | 6.5.0 |
| Runtime | Node.js (via `pg`) | 8.21.0 |
| Language | TypeScript | 5.x |
| Package Manager | pnpm | - |

---

## Architecture & Request Flow

```
HTTP Request
  → Next.js App Router
    → src/app/api/auth/[[...rest]]/route.ts
      → ORPC OpenAPIHandler (with CORS, SmartCoercion, OpenAPIReference plugins)
        → Prefix: /api/auth
          → src/router/index.ts (ORPC router)
            → src/router/auth.ts (handler implementations)
              → src/services/ (AuthService, UserService, EmailService)
                → src/repository/User.repository.ts (Prisma operations)
                  → src/utils/prisma/index.ts (PrismaClient singleton with PrismaPg adapter)
                    → PostgreSQL
```

All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD) on `/api/auth/*` are handled by the same OpenAPIHandler.

---

## Database Schema (Prisma)

6 models in `prisma/schema.prisma`:

### User
| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| name | String? | |
| email | String? | @unique |
| password | String? | |
| emailVerified | DateTime? | |
| image | String? | |
| accounts | Account[] | relation |
| sessions | Session[] | relation |
| Authenticator | Authenticator[] | relation |

### Account (NextAuth compatible)
| Field | Type | Attributes |
|-------|------|------------|
| userId | String | FK → User.id (Cascade) |
| type | String | |
| provider | String | part of composite @id |
| providerAccountId | String | part of composite @id |
| refresh_token | String? | |
| access_token | String? | |
| expires_at | Int? | |
| token_type | String? | |
| scope | String? | |
| id_token | String? | |
| session_state | String? | |

Composite primary key: `@@id([provider, providerAccountId])`

### Session
| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| sessionToken | String | @unique |
| userId | String | FK → User.id |
| expires | DateTime | |

### VerificationToken
| Field | Type | Attributes |
|-------|------|------------|
| identifier | String | (email) |
| token | String | @unique @id |
| expires | DateTime | |

Unique constraint: `@@unique([identifier, token])`

### Authenticator (WebAuthn compatible)
| Field | Type | Attributes |
|-------|------|------------|
| id | String | @id @default(cuid()) |
| credentialID | String | @unique |
| userId | String | FK → User.id (Cascade) |
| providerAccountId | String | |
| credentialPublicKey | String | |
| counter | Int | |
| credentialDeviceType | String | |
| credentialBackedUp | Boolean | |
| transports | String? | |

### Initialization SQL (`prisma/migrations/20260604193738_init/migration.sql`)
- Creates all 5 tables with proper constraints, indexes, and foreign keys
- Unique indexes: `Session.sessionToken`, `User.email`, `VerificationToken.token`, `VerificationToken(identifier,token)`, `Authenticator.credentialID`
- Foreign keys: Account.userId → User.id (CASCADE), Session.userId → User.id (RESTRICT), Authenticator.userId → User.id (CASCADE)

### Second Migration (`prisma/migrations/20260605203423_token_db_primarykey/migration.sql`)
- Adds `PRIMARY KEY ("token")` to VerificationToken table

---

## API Endpoints

### Health Check

- **GET /** → Returns `{ status, message }` with NODE_ENV and origin URL

### Auth Endpoints (all under `/api/auth`)

All endpoints use ORPC contract definitions with Zod validation.

#### 1. POST /api/auth/register

**Contract** (`auth.contract.ts:59-70`):
- Method: POST, Path: `/register`, Success: 201
- Tags: ["auth"]

**Input** (`auth.schema.ts:5-9`):
```ts
{ name: string, email: string, password: string (min 8) }
```
(Picked from UserSchema)

**Output** (`auth.schema.ts:12-15`):
```ts
{ message: string, statusCode: number }
```

**Handler Logic** (`auth.ts:8-52`):
1. Check if user exists → if yes, throw BAD_REQUEST
2. Hash password with bcrypt (10 salt rounds)
3. Generate crypto.randomBytes(16) hex token
4. Build verification URL: `{AUTH_BASE_URL}/verify?token={token}`
5. Save user + verification token in a Prisma transaction
6. Send verification email via Resend
7. Return 201

#### 2. POST /api/auth/verify/{token}

**Contract** (`auth.contract.ts:72-82`):
- Method: POST, Path: `/verify/{token}`, Success: 200
- Tags: ["auth"]

**Input** (`auth.schema.ts:17-19`):
```ts
{ token: string }
```
(Picked from VerificationTokenSchema)

**Output** (`auth.schema.ts:22-26`):
```ts
{ message: string, statusCode: number, identifier: email }
```

**Handler Logic** (`auth.ts:54-87`):
1. Look up token in VerificationToken table
2. If not found → throw NOT_FOUND
3. Check expiry (tokens expire in 1 hour)
4. If expired → throw BAD_REQUEST
5. Update User.emailVerified to now, delete token (in a transaction)
6. Return 200 with identifier (email)

#### 3. POST /api/auth/forgot-password

**Contract** (`auth.contract.ts:84-94`):
- Method: POST, Path: `/forgot-password`, Success: 200
- Tags: ["auth"]

**Input** (`auth.schema.ts:28-30`):
```ts
{ email: string (email format) }
```

**Output** (`auth.schema.ts:33-36`):
```ts
{ message: string, statusCode: number }
```

**Handler Logic** (`auth.ts:89-120`):
1. Check if user exists → if NOT, return 200 anyway (prevents email enumeration)
2. Generate token + reset URL: `{AUTH_BASE_URL}/reset-password?token={token}`
3. Save token to VerificationToken table
4. Send reset password email via Resend
5. Return 200 with generic message

#### 4. POST /api/auth/reset-password

**Contract** (`auth.contract.ts:96-106`):
- Method: POST, Path: `/reset-password`, Success: 200
- Tags: ["auth"]

**Input** (`auth.schema.ts:38-41`):
```ts
{ token: string, password: string (min 8) }
```

**Output** (`auth.schema.ts:44-47`):
```ts
{ message: string, statusCode: number }
```

**Handler Logic** (`auth.ts:122-154`):
1. Look up token in VerificationToken table
2. If not found → throw NOT_FOUND
3. Check expiry → if expired → throw BAD_REQUEST
4. Hash new password with bcrypt
5. Update user password + delete token (in a transaction)
6. Return 200

### Typed Error Codes (defined in `auth.contract.ts:4-57`)

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| BAD_REQUEST | 400 | Invalid request data (with field + issue) |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Permission denied |
| NOT_FOUND | 404 | Resource not found (with resource + issue) |
| CONFLICT | 409 | Resource conflict (with field + value) |
| INTERNAL_SERVER_ERROR | 500 | Unexpected error (with errorId + details) |
| DOMAIN_RULE_VIOLATION | 422 | Business rule violation (with rule) |

---

## Layer-by-Layer Breakdown

### 1. Entry Point - Route Handlers

**`src/app/route.ts`** — Health check endpoint. Returns JSON with NODE_ENV and server origin.

**`src/app/api/auth/[[...rest]]/route.ts`** — Catch-all route that creates a single `OpenAPIHandler` (from `@orpc/openapi/fetch`) with:
- **CORSPlugin**: Cross-origin support
- **SmartCoercionPlugin** with `ZodToJsonSchemaConverter`: Auto-coerces input types (string→number, etc.)
- **OpenAPIReferencePlugin**: Generates OpenAPI spec with title "production-auth-api", bearerAuth security
- **onError interceptor**: Logs errors to console
- Prefix: `/api/auth`

All HTTP verbs (GET, POST, PUT, PATCH, DELETE, HEAD) are mapped to this handler.

### 2. Contracts Layer (`src/contract/`)

ORPC contracts define the API shape without implementation. Uses `oc.errors()` to define typed error factories, then `.route()` to define method, path, success status, summary, description, and tags. Uses `.input()` and `.output()` with Zod schemas.

Contracts are exported from `auth.contract.ts` and aggregated in `index.ts` under the namespace `production_auth_api`:
```ts
contract = {
  production_auth_api: {
    register,    // RegisterUserContract
    verify,      // VerifyUserContract
    forgotPassword,  // ForgotPasswordContract
    resetPassword    // ResetPasswordContract
  }
}
```

### 3. Schema Layer (`src/schema/`)

**`db_tables.schema.ts`** — Zod schemas for all 5 DB models (UserSchema, AccountSchema, SessionSchema, VerificationTokenSchema, AuthenticatorSchema). These match the Prisma-generated types.

**`auth.schema.ts`** — Input/output schemas for each endpoint, derived by picking/defining from db_tables schemas. Defines TypeScript types via `z.infer`.

### 4. Router Layer (`src/router/`)

**`src/router/index.ts`** — Uses `implement(contract)` from ORPC to create a typed router with all 4 handlers.

**`src/router/auth.ts`** — Handler implementations. Each handler receives `{ input, errors, context }` from ORPC. Business logic:
- `RegisterUser`: Checks existence → hashes → generates token → saves → sends email
- `VerifyToken`: Finds token → checks expiry → verifies user → deletes token
- `ForgotPassword`: Checks existence (silently) → generates token → saves → sends email
- `ResetPassword`: Finds token → checks expiry → hashes → updates password → deletes token

### 5. Services Layer (`src/services/`)

**`AuthService.ts`** (class `AuthFunctions`):
- `HashPayload(password)` — bcrypt with 10 salt rounds
- `GenerateToken()` — crypto.randomBytes(16).toString('hex')
- `GenerateURL(token)` — `{AUTH_BASE_URL}/verify?token={token}`
- `GenerateResetURL(token)` — `{AUTH_BASE_URL}/reset-password?token={token}`
- `makeUserverified(email, token)` — delegates to Useroperations.makeUserverified

**`UserService.ts`** (class `UserFunctions`):
- `UserExists({email})` — checks if user exists in DB
- `RegisterUser(payload)` — delegates to Useroperations.saveRegistration
- `GetTokenDetails(userToken)` — finds token in VerificationToken table
- `CheckExpiry(timeLimit)` — compares Date.now() against token expiry
- `SaveResetToken(email, token)` — saves new reset token
- `ResetPassword(email, token, hashedPassword)` — updates password + deletes token

**`EmailService.ts`** (class `EmailFunctions`):
- `sendMail({ VERIFICATION_URL, email, username })` — sends verification email via Resend from `production-auth-api@resend.dev`
- `sendResetPasswordMail({ RESET_URL, email, username })` — sends reset password email via Resend

### 6. Repository Layer (`src/repository/`)

**`UserOperations`** class — All Prisma DB interactions:
- `finduser(email)` → `prisma.user.findUnique` → returns User or null
- `saveRegistration(payload)` → Prisma `$transaction([user.create, verificationToken.create])` — token expires in 1 hour
- `findTokenDetails(payload)` → `prisma.verificationToken.findUnique` by token
- `makeUserverified(email, token)` → `$transaction([user.update(emailVerified=now), verificationToken.delete])`
- `saveResetToken(identifier, token)` → `prisma.verificationToken.create` with 1 hour expiry
- `resetPassword(email, token, hashedPassword)` → `$transaction([user.update(password=hash), verificationToken.delete])`

### 7. Utilities (`src/utils/`)

**`configurations.ts`** — Validates environment variables with Zod:
```ts
{
  NODE_ENV: "development" | "production" | "test" (default: "development"),
  DATABASE_URL: url starting with "postgresql://",
  AUTH_BASE_URL: valid url,
  MAIL_SERVICE_API_KEY: string starting with "re_"
}
```
Exits process with code 1 if validation fails. Exports typed `env` object.

**`prisma/index.ts`** — PrismaClient singleton with:
- PrismaPg adapter with connection string from DATABASE_URL
- Global singleton pattern (preserves across hot reloads in dev)
- Logging: query, info, warn

### 8. Email Templates (`src/emails/`)

Both use React Email components (Html, Head, Font, Preview, Heading, Section, Text, Button, Body, Container, Hr, Link). Styled with inline styles, brand color #4f46e5 (Indigo). Include fallback link text, security footer, and company address.

---

## Environment Variables

| Variable | Required | Validation | Example |
|----------|----------|------------|---------|
| DATABASE_URL | Yes | Must be a URL starting with `postgresql://` | `postgresql://...@ep-long-cloud...neon.tech/neondb` |
| AUTH_BASE_URL | Yes | Must be a valid URL | `http://localhost:3000/` |
| MAIL_SERVICE_API_KEY | Yes | Must start with `re_` | `re_...` |
| NODE_ENV | No (default: "development") | Must be "development", "production", or "test" | `development` |

---

## Package Scripts

| Command | Script |
|---------|--------|
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm start` | `next start` |

---

## Key Design Patterns & Conventions

1. **ORPC Contract-First**: API shape defined in contracts, then implemented by handlers. Provides full type safety from contract → handler → response.

2. **Service Layer Pattern**: Handlers delegate to service classes (AuthService, UserService, EmailService), which delegate to repository classes (Useroperations). Clear separation of concerns.

3. **Prisma Transactions**: All operations that modify two tables (user + token) use `prisma.$transaction()` for atomicity.

4. **Singleton PrismaClient**: Uses the global object pattern to prevent multiple PrismaClient instances during Next.js hot reloads.

5. **Early Exit on Config Failure**: Environment validation calls `process.exit(1)` on failure — fails fast.

6. **Token Expiry**: All verification/reset tokens expire in 1 hour (`Date.now() + 60 * 60 * 1000`).

7. **Silent Forgot Password**: Returns same success message whether email exists or not, preventing email enumeration attacks.

8. **Typed Errors**: ORPC's error system provides structured errors with HTTP status codes and typed data payloads.

9. **bcrypt**: Uses bcrypt with 10 salt rounds for password hashing.

10. **Path Alias**: `@/` maps to `./src/*` (configured in tsconfig.json).

---

## How to Work With This Codebase

1. **Adding a new endpoint**: Create a contract in `src/contract/`, add input/output schemas in `src/schema/auth.schema.ts`, implement the handler in `src/router/auth.ts`, add service/repository methods as needed.
2. **Modifying the database**: Edit `prisma/schema.prisma`, run `npx prisma migrate dev`, regenerate client.
3. **Adding email templates**: Add a new `.tsx` file in `src/emails/`, add sending method in `src/services/EmailService.ts`.
4. **Running locally**: Ensure `.env` is configured, run `npm run dev`.
