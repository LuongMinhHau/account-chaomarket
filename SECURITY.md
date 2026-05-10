# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Active support  |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it responsibly.

**Do NOT open a public issue.**

### Contact

- **Email**: security@chaomarket.com
- **Response SLA**: We will acknowledge your report within **48 hours** and aim to provide a fix within **7 business days** for critical issues.

### What to include

1. A description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Any suggested fix (optional)

## Security Measures

This project implements the following security controls:

- **Authentication**: NextAuth v4 with JWT strategy and bcrypt-12 password hashing
- **2FA**: TOTP-based two-factor authentication with hashed backup codes
- **Rate Limiting**: Per-IP rate limiting on all auth endpoints
- **OTP**: SHA-256 hashed, 10-minute TTL email verification codes
- **Input Sanitization**: DOMPurify (client) + sanitize-html (server)
- **HTTP Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Audit Logging**: Non-blocking database logging of all auth events
- **Cross-Subdomain SSO**: Secure JWT cookie scoped to `.chaomarket.com`

## Responsible Disclosure

We appreciate the security community's efforts in helping keep our users safe. We will credit researchers who responsibly disclose vulnerabilities (with their permission).
