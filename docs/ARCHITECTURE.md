# Chào Market Account — Centralized Auth Service

## Overview

Centralized authentication service at `account.chaomarket.com` for the Chào Market Enterprise ecosystem.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth v4 (JWT strategy, `.chaomarket.com` cookie domain) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (shared with ChaoMarket Web) |
| UI | Shadcn UI + FloatingLabelInput |
| Validation | Zod |
| Email | Brevo REST API (11 bilingual templates) |
| Monitoring | Sentry |
| Port | 3002 |

## Architecture

```
Browser → Next.js (:3002) → PostgreSQL (shared with ChaoMarket)
                ↓
          NextAuth v4 (JWT, .chaomarket.com cookie)
                ↓
          Brevo REST API (Email Templates)
          Sentry (Error Tracking)
```

## Features

### Authentication
- **Email/Password**: bcrypt-12 password hashing
- **Google OAuth**: Social login integration
- **6-digit OTP**: Email verification (SHA-256 hashed, 10min TTL)
- **3-step Password Reset**: Request → Verify OTP → Set new password
- **Cross-subdomain SSO**: JWT cookie with `.chaomarket.com` domain

### Security
- **Per-IP Rate Limiting**: In-memory, 4 action types (login, register, OTP, password-reset)
- **Anti-enumeration Patterns**: Consistent responses regardless of user existence
- **bcrypt-12**: Industry-standard password hashing
- **Non-blocking Audit Logging**: Background logging of auth events

### Frontend
- **Dark-mode 2-column Layout**: Branding panel + Auth form
- **FloatingLabelInput**: Custom animated input component
- **Zod Validation**: Client-side form validation
- **sessionStorage Form Persistence**: Preserve form data across page refreshes

### Email Templates
- 11 bilingual templates (Vietnamese + English) via Brevo REST API
- Templates: Welcome, OTP Verification, Password Reset, Account Locked, etc.

## Project Stats
- **Source Files**: ~50 files
- **Lines of Code**: ~5,472 LoC
- **Single commit**: Initial architecture setup

## Deployment
- **Docker**: Multi-stage build
- **CI/CD**: GitHub Actions → Docker Hub → SSH deploy to `/opt/chaomarket`
- **Docker Hub Image**: `minhhauluong/chao-market-account`

## SSO Integration Pattern

Other Chào Enterprise services (e.g., thuexe.chaomarket.com, chaonews.chaomarket.com) authenticate users by:
1. Reading the JWT cookie from `.chaomarket.com` domain
2. Verifying the token with the shared `NEXTAUTH_SECRET`
3. Extracting user info from the JWT payload
4. Redirecting to `account.chaomarket.com/login` for unauthenticated users
