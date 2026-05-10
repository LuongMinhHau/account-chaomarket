# Contributing to Chào Market Account

Thank you for your interest in contributing to this project.

## Development Setup

```bash
pnpm install
cp .env.example .env.local   # Fill in required values
pnpm dev                      # http://localhost:2000
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Auto-deploys via CI/CD. |
| `feature/*` | New features. Branch from `main`, PR back to `main`. |
| `fix/*` | Bug fixes. Branch from `main`, PR back to `main`. |
| `hotfix/*` | Urgent production fixes. Branch from `main`. |

## Coding Standards

### TypeScript
- **Strict mode** enabled (`tsconfig.json`)
- Minimize `any` usage — use proper types or `unknown`
- Prefer `interface` for object shapes, `type` for unions/utilities

### Logging
- **Never** use `console.log/error/warn` in production code
- Use `import { logger } from '@/lib/logger'` for all logging
- Use `logApiEvent()` for key business events

### Error Handling
- **Never** leave empty `catch {}` blocks — at minimum log with `logger.warn()`
- Use structured error responses via `ApiResponse` type

### Environment Variables
- **Never** use `process.env.X!` directly
- Use `import { env } from '@/lib/env'` for validated access
- Add new vars to both `.env.example` and `src/lib/env.ts`

### Components
- Keep page files under **300 lines** — extract sub-components
- Use `'use client'` only when necessary
- Prefer server components for data fetching

### Internationalization
- All user-facing text must use `t('key')` from `useI18n()`
- Add translations to both `public/locales/en.ts` and `vi.ts`
- Type new keys in `src/types/translations/`

## Pull Request Process

1. Create a feature/fix branch from `main`
2. Make your changes with clear, atomic commits
3. Ensure `pnpm build` passes without errors
4. Ensure `pnpm lint` passes without warnings
5. Open a PR with a clear description of changes
6. Request review from a maintainer

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user avatar crop dialog
fix: resolve OTP expiration race condition
chore: update dependencies
docs: add API endpoint documentation
refactor: extract ProfileHeader component
```
