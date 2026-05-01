# Chào Market Account

Centralized authentication service for the Chào Market ecosystem at `account.chaomarket.com`.

## Architecture

- **Framework**: Next.js 16 (App Router, standalone output)
- **Auth**: NextAuth v4 (JWT strategy, `.chaomarket.com` cookie domain)
- **Database**: Shared PostgreSQL with ChaoMarket Web (Drizzle ORM)
- **Email**: Brevo transactional API
- **Port**: 3001

## Features

- Email/password authentication with OTP verification
- Google OAuth
- Password reset flow (3-step)
- Cross-subdomain SSO via shared JWT cookie
- Rate limiting (per-IP, in-memory)
- Bilingual email templates (VI/EN)

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3001
```

## Environment

Copy `.env.example` → `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection (shared with ChaoMarket Web) |
| `NEXTAUTH_SECRET` | **Must match** ChaoMarket Web for cross-subdomain JWT |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `BREVO_API_KEY` | Transactional email |
| `COOKIE_DOMAIN` | `.chaomarket.com` (production only) |

## Deployment

```bash
docker build -t minhhauluong/chao-market-account .
docker push minhhauluong/chao-market-account:latest
```

Or via GitHub Actions on push to `main`.
