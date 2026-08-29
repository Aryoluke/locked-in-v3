# LOCKED IN self-hosted server

This service is the future single source of truth for squad sync. Keep secrets in environment variables, never Git.

Planned production stack:
- FastAPI
- PostgreSQL
- Argon2 password hashing
- JWT access/refresh sessions
- Invite approval flow
- Per-field last-write-wins using server timestamps
- Offline mutation queue + idempotency keys
- Encrypted private media
- Daily encrypted backups
- HTTPS behind Caddy
- Optional Tailscale/WireGuard access
- REST API for personal exports

The Flutter client is deliberately usable offline before the server is configured.
