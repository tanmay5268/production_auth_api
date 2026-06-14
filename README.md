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

A production-grade authentication API built with Next.js, ORPC, and Prisma. Provides user registration, email verification, password reset, and forgot password flows with typed, validated endpoints backed by PostgreSQL.

---

## Features

- **User Registration** — Create accounts with hashed passwords (bcrypt) and email verification
- **Email Verification** — Time-limited token-based email confirmation (1-hour TTL)
- **Forgot Password** — Secure password reset flow with token expiry; protects against email enumeration
- **Password Reset** — Reset passwords via email-sent tokens with validation
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
| **Services** | `src/services/` | Hashing, token generation, email sending |
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

### Error codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `BAD_REQUEST` | Invalid input, expired token, duplicate email |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource (token, user) not found |
| 409 | `CONFLICT` | Resource conflict |
| 422 | `DOMAIN_RULE_VIOLATION` | Business rule violation |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Project Structure

```
src/
├── app/api/auth/[[...rest]]/route.ts   # Next.js handler + ORPC setup
├── contract/
│   └── auth.contract.ts                 # API contract definitions
├── emails/
│   ├── VerificationEmail.tsx            # Email verification template
│   └── ResetPasswordEmail.tsx           # Password reset template
├── repository/
│   └── User.repository.ts               # Prisma database queries
├── router/
│   ├── index.ts                         # ORPC router aggregation
│   └── auth.ts                          # Auth route handlers
├── schema/
│   ├── auth.schema.ts                   # Zod schemas for auth endpoints
│   └── db_tables.schema.ts              # Database model schemas
├── services/
│   ├── AuthService.ts                   # Hashing, token/URL generation
│   ├── UserService.ts                   # User business logic
│   └── EmailService.ts                  # Resend email integration
└── utils/
    ├── configurations.ts               # Environment variable validation
    └── prisma/index.ts                  # Prisma client singleton

prisma/
├── schema.prisma                        # Database schema (6 models)
└── migrations/                          # PostgreSQL migrations
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
| [Neon](https://neon.tech) | Serverless PostgreSQL (hosted) |

---

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
```
