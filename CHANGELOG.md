# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-10

### Added
- Centralized authentication service at `account.chaomarket.com`
- Email/password authentication with bcrypt-12 hashing
- Google OAuth social login
- 6-digit OTP email verification (SHA-256 hashed, 10-min TTL)
- 3-step password reset flow
- Cross-subdomain SSO via `.chaomarket.com` JWT cookie
- TOTP-based 2FA with backup codes
- Per-IP rate limiting (login, register, OTP, password-reset)
- 11 bilingual email templates (Vietnamese + English) via Brevo API
- User profile management with OTP-verified edits
- Avatar upload via Cloudflare R2
- Device tracking and session management
- Security audit logging (non-blocking)
- Notification system (security, system, account, order types)
- Order history and transaction management
- Direct purchase flow with PayOS payment gateway
- Consultation booking gateway
- Dark/light theme support
- Responsive sidebar navigation (desktop + mobile)
- Full internationalization (VI/EN) with 23 translation modules
- Sentry error monitoring (client + server + edge)
- Pino structured logging with Better Stack forwarding
- Docker multi-stage build with standalone output
- GitHub Actions CI/CD pipeline
- Comprehensive security headers (CSP, HSTS, X-Frame-Options)
- Enterprise env validation with Zod
- Compliance documentation (SECURITY.md, LICENSE, CONTRIBUTING.md)

### Security
- Input sanitization (DOMPurify + sanitize-html)
- Anti-enumeration patterns on auth endpoints
- Non-blocking audit trail for all auth events
- Permissions-Policy header (camera, microphone, geolocation disabled)
