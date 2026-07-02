# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in LinkBreeze, please report it
responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **manak@omnirise.dev**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within 48 hours.

## Security Measures

LinkBreeze implements the following security practices:

- **Auth**: bcrypt password hashing (12 rounds), HMAC-signed session cookies
- **Sessions**: httpOnly, SameSite cookies, 30-day expiry
- **Input validation**: Zod schemas on every server action and API route
- **SQL injection prevention**: Drizzle ORM parameterized queries (no raw SQL)
- **Security headers**: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy on all routes
- **X-Frame-Options**: SAMEORIGIN (prevents external clickjacking)
- **URL validation**: Rejects `javascript:`, `data:`, `blob:` schemes
- **File uploads**: Type whitelist (images only), size limit (2 MB), path-traversal-safe filename resolution
- **Docker**: Runs as non-root user (`node`), data volume is the only writable path
- **Rate limiting**: Analytics tracking endpoint (per-IP fixed window, 60 req/min)
- **CSP on SVG**: Content-Security-Policy strips scripts/sandbox from served SVG images
- **Privacy-first analytics**: No raw IP storage — visitor hashes use SHA-256 with a daily-rotating salt

## Known Limitations (v1.0.0)

The following are NOT yet implemented. If you need these, track the corresponding
issue or contribute:

- **Login rate limiting**: The login form does not currently rate-limit failed
  attempts. Protect behind a reverse proxy with rate limiting (e.g., Caddy,
  Cloudflare) if exposed to the public internet.
- **Password recovery**: No self-service reset flow. If you lose your password,
  see the [Troubleshooting guide](TROUBLESHOOTING.md#forgot-admin-password)
  for three recovery methods (hash reset, full reset, or database deletion).
- **2FA**: Not yet available.

## Disclosure Timeline

1. Report received → acknowledged within 48h
2. Fix developed → timeline depends on severity
3. Patch released → advisory published
4. Public disclosure → after patch is available

## Scope

This policy covers the LinkBreeze application code in this repository.
Third-party dependencies should be reported to their respective maintainers.
