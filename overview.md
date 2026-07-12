# Production Auth API - Overview

A production-grade authentication API built with **Next.js 16**, **ORPC (Open RPC)**, **Prisma ORM**, **PostgreSQL**, **Resend** (email), and **TypeScript**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
│  src/app/api/[[...rest]]/route.ts  (OpenAPI Handler)            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORPC Router Layer                           │
│  src/router/index.ts  →  src/router/auth.ts                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│  AuthService     │ │  UserService    │ │  EmailService    │
│  (crypto, bcrypt)│ │  (business)     │ │  (Resend +       │
│                  │ │                 │ │   React Email)   │
└──────────────────┘ └─────────────────┘ └──────────────────┘
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository Layer                            │
│  src/repository/User.repository.ts  (Prisma Client)             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│  Prisma Schema: User, Account, Session, VerificationToken,      │
│  Authenticator                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 (App Router) | React framework with API routes |
| RPC | ORPC (Open RPC) | Type-safe API contracts with Zod |
| Database | Prisma ORM + PostgreSQL | Type-safe database access |
| Email | Resend + React Email | Transactional emails with JSX templates |
| Auth | bcrypt (password hashing), crypto (tokens) | Secure authentication primitives |
| Validation | Zod v4 | Runtime schema validation |
| Config | dotenv + Zod | Type-safe environment validation |

---

## Project Structure

```
src/
├── app/
│   └── api/[[...rest]]/route.ts    # ORPC OpenAPI handler entry point
├── contract/
│   ├── index.ts                    # Combined contract exports
│   └── auth.contract.ts            # Auth API contracts (4 endpoints)
├── router/
│   ├── index.ts                    # ORPC router composition
│   └── auth.ts                     # Auth endpoint implementations
├── services/
│   ├── AuthService.ts              # Token generation, password hashing, URLs
│   ├── UserService.ts              # Business logic orchestration
│   └── EmailService.ts             # Email sending via Resend
├── repository/
│   └── User.repository.ts          # Prisma database operations
├── schema/
│   ├── auth.schema.ts              # Zod input/output schemas
│   └── db_tables.schema.ts         # Zod schemas from Prisma models
├── emails/
│   ├── VerificationEmail.tsx       # React Email template
│   └── ResetPasswordEmail.tsx      # React Email template
├── utils/
│   ├── prisma/index.ts             # Prisma client singleton
│   └── configurations.ts           # Zod-validated env config
└── generated/prisma/               # Prisma Client (generated)
```

---

## API Endpoints

### 1. Register User
- **POST** `/api/auth/register`
- **Input**: `{ name: string, email: string, password: string }`
- **Flow**:
  1. Check if user exists
  2. Hash password (bcrypt, 10 rounds)
  3. Generate verification token (16-byte hex)
  4. Save user + token in transaction (token expires 1 hour)
  5. Send verification email via Resend
- **Output**: `{ statusCode: 201, message: "userCreated" }`

### 2. Verify Email
- **POST** `/api/auth/verify/{token}`
- **Input**: `{ token: string }`
- **Flow**:
  1. Find token in VerificationToken table
  2. Check expiry (1 hour)
  3. Update user: `emailVerified = now`
  4. Delete used token
- **Output**: `{ statusCode: 200, message: "User verified", identifier: email }`

### 3. Forgot Password
- **POST** `/api/auth/forgot-password`
- **Input**: `{ email: string }`
- **Flow**:
  1. Check if user exists (returns generic success either way)
  2. Generate reset token (16-byte hex)
  3. Save token in VerificationToken table (expires 1 hour)
  4. Send reset password email
- **Output**: `{ statusCode: 200, message: "If an account... reset link has been sent." }`

### 4. Reset Password
- **POST** `/api/auth/reset-password`
- **Input**: `{ token: string, password: string (min 8 chars) }`
- **Flow**:
  1. Find token in VerificationToken table
  2. Check expiry (1 hour)
  3. Hash new password
  4. Update user password + delete token (transaction)
- **Output**: `{ statusCode: 200, message: "Password has been reset successfully." }`

---

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?   // bcrypt hash
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  Authenticator Authenticator[]
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
}

model VerificationToken {
  identifier String
  token      String   @unique @id
  expires    DateTime
  @@unique([identifier, token])
}

model Authenticator {
  id                   String  @id @default(cuid())
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?
  user                 User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Environment Variables (Validated via Zod)

| Variable | Description | Validation |
|----------|-------------|------------|
| `NODE_ENV` | Environment | `development \| production \| test` |
| `DATABASE_URL` | PostgreSQL connection string | Must be `postgresql://` URL |
| `AUTH_BASE_URL` | Base URL for verification links | Valid URL, non-empty |
| `MAIL_SERVICE_API_KEY` | Resend API key | Must start with `re_`, non-empty |

---

## Key Design Patterns

### 1. **Contract-First Development**
- Contracts defined in `src/contract/auth.contract.ts` using ORPC
- Input/output validated via Zod schemas
- Automatic OpenAPI spec generation
- Type-safe client generation possible

### 2. **Layered Architecture**
- **Router**: HTTP handling, contract implementation
- **Services**: Business logic, orchestration
- **Repository**: Database operations (Prisma)
- **Emails**: UI components (React Email)

### 3. **Database Transactions**
- User registration: Creates user + verification token atomically
- Email verification: Updates user + deletes token atomically
- Password reset: Updates password + deletes token atomically

### 4. **Security Practices**
- Passwords hashed with bcrypt (10 rounds)
- Tokens: 16-byte cryptographically random hex (32 chars)
- Token expiry: 1 hour for both verification and reset
- Generic error messages for forgot password (prevents email enumeration)

### 5. **Error Handling**
- Standardized error types via ORPC base contract
- Errors: BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, etc.
- Structured error responses with field/issue details

---

## Running the Project

```bash
# Install dependencies
pnpm install

# Set up environment variables (see .env.example)
cp .env.example .env
# Edit .env with your values

# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

---

## API Documentation

OpenAPI/Swagger docs available at `/api` when running the server (via ORPC OpenAPIReferencePlugin).

---

## Extending the API

1. **Add new contract** in `src/contract/auth.contract.ts`
2. **Add schema** in `src/schema/auth.schema.ts`
3. **Implement handler** in `src/router/auth.ts`
4. **Add service logic** in `src/services/`
5. **Add repository methods** in `src/repository/User.repository.ts`
6. **Register in router** in `src/router/index.ts`