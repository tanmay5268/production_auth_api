<div align="center">

# Production Auth API

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![ORPC](https://img.shields.io/badge/ORPC-1.14-6366F1?style=flat-square)](https://orpc.unnoq.com)
[![Zod](https://img.shields.io/badge/Zod-4-3068B7?style=flat-square&logo=zod)](https://zod.dev)
[![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square&logo=resend)](https://resend.com)

</div>

A production-grade authentication API built with Next.js, ORPC, and Prisma. Provides user registration, email verification, password reset, and multiple login flows (session cookie + access/refresh tokens) with typed, validated endpoints backed by PostgreSQL.

---

## Features

- **User Registration** — Create accounts with hashed passwords (bcrypt) and email verification
- **Email Verification** — Time-limited token-based email confirmation (1-hour TTL)
- **Forgot Password** — Secure password reset flow with token expiry; protects against email enumeration
- **Password Reset** — Reset passwords via email-sent tokens with validation
- **JWT Session Login** — Traditional session cookie authentication with httpOnly cookies
- **Access/Refresh Token Login** — Stateless access tokens (JWT) with rotating refresh tokens stored in DB
- **Token Revocation** — Explicit refresh token revocation (logout) with cookie cleanup
- **Token Refresh** — Obtain new access tokens using valid refresh tokens
- **Account Lockout** — Automatic locking after 5 failed login attempts (15-minute lockout)
- **Typed API Contracts** — End-to-end type safety with ORPC contracts and Zod schemas
- **OpenAPI Spec** — Auto-generated OpenAPI documentation via ORPC
- **Email Notifications** — Transactional emails via Resend with React Email templates
- **CORS Enabled** — Cross-origin support out of the box

---

## Architecture

```
Request → Next.js (App Router) → ORPC OpenAPI Handler → Router → Service → Repository → Prisma → PostgreSQL
                                                               ↕
                                                         Email Service (Resend)
```

The API is powered by **ORPC** — a type-safe RPC framework that sits on top of Next.js route handlers. Input validation, error handling, and OpenAPI spec generation are all handled automatically from a single contract definition.

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Routes** | `src/app/api/auth/` | Next.js catch-all handler, ORPC setup |
| **Contracts** | `src/contract/` | API route definitions with Zod schemas |
| **Router** | `src/router/` | Business logic for each endpoint |
| **Services** | `src/services/` | Hashing, token generation, email sending, JWT |
| **Repository** | `src/repository/` | Prisma database operations |
| **Emails** | `src/emails/` | React Email templates |
| **Schema** | `src/schema/` | Zod input/output validation schemas |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or a hosted option like [Neon](https://neon.tech))
- [Resend](https://resend.com) API key

### Install

```bash
pnpm install
```

### Configure environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://...`) |
| `AUTH_BASE_URL` | Yes | Base URL for verification/reset links (e.g. `http://localhost:3000/api/auth`) |
| `MAIL_SERVICE_API_KEY` | Yes | Resend API key (must start with `re_`) |
| `NODE_ENV` | No | Environment: `development`, `production`, or `test` |

### Run database migrations

```bash
pnpm prisma migrate dev
```

### Start development server

```bash
pnpm dev
```

The API is now available at `http://localhost:3000/api/auth`.

---

## API Reference

All endpoints accept and return JSON. Error responses follow a typed contract with consistent error codes.

### `POST /api/auth/register`

Create a new user account. Sends a verification email with a time-limited token.

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** `201`:

```json
{
  "message": "userCreated",
  "statusCode": 201
}
```

> [!NOTE]
> Passwords are hashed with bcrypt (10 salt rounds). Verification tokens expire after 1 hour.

---

### `POST /api/auth/verify/{token}`

Verify a user's email address using the token received via email.

**Path parameter:** `token` — the 32-character hex token from the verification email

**Response** `200`:

```json
{
  "identifier": "john@example.com",
  "statusCode": 200,
  "message": "User verified"
}
```

---

### `POST /api/auth/forgot-password`

Request a password reset email.

**Request body:**

```json
{
  "email": "john@example.com"
}
```

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

> [!TIP]
> This endpoint always returns 200 regardless of whether the email exists, preventing email enumeration attacks.

---

### `POST /api/auth/reset-password`

Reset a password using a valid, non-expired token.

**Request body:**

```json
{
  "token": "abc123...",
  "password": "newSecurePassword456"
}
```

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "Password has been reset successfully."
}
```

---

### `POST /api/auth/loginjwtsession`

Login with traditional session cookie authentication. Returns user info and sets an httpOnly session cookie.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Cookie set:** `session_token` (httpOnly, Secure, SameSite=Lax, 7-day expiry)

> [!NOTE]
> Requires email verification. Account locks after 5 failed attempts for 15 minutes.

---

### `POST /api/auth/login_access_refresh`

Login with access/>

Login with stateless access tokens (JWT) and rotating refresh tokens stored in database. Both tokens set as httpOnly cookies.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Headers required:** `User-Agent` (used for refresh token tracking)

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Cookies set:**
- `accessToken` — JWT access token (7-day expiry, httpOnly, Secure, SameSite=Strict)
- `refreshToken` — Opaque refresh token (7-day expiry, httpOnly, Secure, SameSite=Strict)

> [!NOTE]
> Requires email verification. Account locks after 5 failed attempts for 15 minutes. Refresh token stored in DB with user agent for audit.

---

### `POST /api/auth/refreshToken`

Obtain a new access token using a valid refresh token.

**Request body:**

```json
{
  "refreshToken": "abc123..."
}
```

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "Access token refreshed successfully"
}
```

**Cookie updated:** `accessToken` (new JWT, 7-day expiry)

> [!NOTE]
> Validates refresh token exists in DB, is not revoked, and not expired. Returns 401 if invalid.

---

### `POST /api/auth/revokeToken`

Revoke a refresh token (logout). Clears both access and refresh token cookies.

**Request body:**

```json
{
  "refreshToken": "abc123..."
}
```

**Response** `200`:

```json
{
  "statusCode": 200,
  "message": "Refresh token revoked successfully"
}
```

**Cookies cleared:** Both `accessToken` and `refreshToken` set with `Max-Age=0`

---

### Error codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `BAD_REQUEST` | Invalid input, expired token, duplicate email, missing User-Agent |
| 401 | `UNAUTHORIZED` | Invalid credentials, invalid/expired refresh token |
| 403 | `FORBIDDEN` | Account locked (5 failed attempts), email not verified |
| 404 | `NOT_FOUND` | Resource (token, user) not found |
| 409 | `CONFLICT` | Resource conflict (duplicate email) |
| 422 | `DOMAIN_RULE_VIOLATION` | Business rule violation |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Project Structure

```
src/
├── app/
│   ├── api/[[...rest]]/route.ts      # Next.js handler + ORPC OpenAPI setup
│   └── route.ts                      # Health check endpoint
├── contract/
│   ├── index.ts                      # Combined contract exports
│   └── auth.contract.ts              # API contract definitions (8 endpoints)
├── emails/
│   ├── VerificationEmail.tsx         # Email verification template
│   └── ResetPasswordEmail.tsx        # Password reset template
├── repository/
│   ├── User.repository.ts            # Prisma user/token operations
│   └── refresh.repository.ts         # Refresh token CRUD operations
├── router/
│   ├── index.ts                      # ORPC router aggregation
│   ├── os.ts                         # ORPC server implementation with context
│   └── auth.ts                       # Auth route handlers (8 endpoints)
├── schema/
│   ├── auth.schema.ts                # Zod schemas for auth endpoints
│   └── db_tables.schema.ts           # Database model Zod schemas
├── services/
│   ├── AuthService.ts                # Hashing, token/URL generation, JWT
│   ├── UserService.ts                # Business logic orchestration
│   ├── EmailService.ts               # Resend email integration
│   └── TokenService.ts               # JWT access token signing/verification
└── utils/
    ├── configurations.ts             # Environment variable validation (Zod)
    └── prisma/index.ts               # Prisma client singleton

prisma/
├── schema.prisma                     # Database schema (6 models)
└── migrations/                       # PostgreSQL migrations
```

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
  failedLoginCount  Int       @default(0)
  lockedUntil       DateTime?
  accounts      Account[]
  sessions      Session[]
  Authenticator Authenticator[]
  RefreshToken  RefreshToken[]
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

model RefreshToken {
  id          String   @id @default(cuid())
  tokenHash   String   @unique
  userId      String
  expiresAt   DateTime
  revokedAt   DateTime?
  replacedBy  String?
  userAgent   String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId])
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

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js](https://nextjs.org) (16) | Application framework & HTTP server |
| [ORPC](https://orpc.unnoq.com) (1.14) | Type-safe RPC framework with OpenAPI |
| [Prisma](https://prisma.io) (7.8) | ORM with PostgreSQL |
| [Zod](https://zod.dev) (4) | Runtime schema validation |
| [Resend](https://resend.com) | Transactional email delivery |
| [React Email](https://react.email) | Email component templates |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | JWT access tokens |
| [crypto](https://nodejs.org/api/crypto.html) | Secure token generation |
| [Neon](https://neon.tech) | Serverless PostgreSQL (hosted) |

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
- Account lockout after 5 failed attempts (15-minute duration)
- Refresh tokens stored hashed in DB with user agent tracking
- httpOnly, Secure, SameSite=Strict cookies for token storage

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
5. **Add repository methods** in `src/repository/`
6. **Register in router** in `src/router/index.ts`

---

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
```