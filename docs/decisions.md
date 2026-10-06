# Architecture Decision Records

Each record follows: **Problem / Decision / Alternatives / Reason / Trade-offs**.

---

## ADR-001: Server-side sessions in an HttpOnly cookie (not JWT)

- **Problem:** The API must know which user is calling it. The plan asks for secure HTTP-only cookies or another established session approach, and no custom crypto.
- **Decision:**
  - On login or registration, the server generates an opaque random token with `secrets.token_urlsafe(32)` and sends it in a `session` cookie (HttpOnly, SameSite=Lax, `Secure` configurable, 7-day Max-Age).
  - The DB stores only the token's SHA-256 hash, in `user_sessions`.
  - Logout deletes the row.
  - Passwords are hashed with argon2 (`argon2-cffi`).
- **Alternatives:**
  - JWT in localStorage: readable by any XSS payload.
  - JWT in a cookie: stateless, but can't be revoked before it expires without a denylist.
  - A third-party auth provider: overkill for a portfolio app, and it hides the learning.
- **Reason:** Sessions are simple, revocable right away (logout really logs out), and keep the token out of JavaScript entirely. Hashing tokens at rest means a DB leak can't be replayed as cookies.
- **Trade-offs:**
  - Every authenticated request costs one indexed DB lookup. That's negligible at this scale, and Redis could cache it later (V7) if it were ever measured as a bottleneck.
  - Expired session rows build up. A cleanup job fits naturally with the V6 background worker.

## ADR-002: `/api/v1` prefix and PATCH for updates

- **Problem:** The plan's V1 section lists unprefixed `PUT /applications/{id}`, while §7 specifies `/api/v1/...` with `PATCH`.
- **Decision:** Follow §7. Every resource endpoint is under `/api/v1`, and updates are `PATCH` with partial-update semantics (only fields present in the body change). `GET /health` stays unversioned for infrastructure probes.
- **Alternatives:** PUT with full replacement, which would force the client to send every field.
- **Reason:** §7 is the long-term API contract. PATCH matches how the UI actually edits (it changes a status without resending everything).
- **Trade-offs:** The PATCH schema has to tell "field omitted" apart from "field explicitly null". This is handled with `exclude_unset`, plus a validator that rejects `null` for required fields.

## ADR-003: Authentication pulled into the MVP

- **Problem:** V1 requires every application to belong to a user, but auth is scheduled for V2.
- **Decision:** At the user's request, real register/login/logout and protected routes were built together with V1 CRUD.
- **Alternatives:** A seeded single demo user behind a swappable `get_current_user` dependency.
- **Reason:** It avoids building throwaway scaffolding, and the app is multi-user and isolation-tested from the first release.
- **Trade-offs:** The first milestone was larger.

## ADR-004: Backend tests run against real PostgreSQL

- **Problem:** Tests need a database.
- **Decision:** pytest uses a dedicated `tracker_test` database, created by the Postgres init script. The schema is created once per test session and tables are truncated after each test. `conftest.py` refuses to run against any other database name.
- **Alternatives:** In-memory SQLite, which is faster but lacks native enums and has different SQL semantics.
- **Reason:** Prod parity. Enum types, constraints, timezone handling and `GROUP BY` behave exactly as in production.
- **Trade-offs:** Tests need the `db` container running. CI (V10) will use a Postgres service container.

## ADR-005: No repository layer (yet)

- **Problem:** The plan's suggested structure includes both `services/` and `repositories/`.
- **Decision:** Only `services/` exists. Service functions contain the (user-scoped) SQLAlchemy queries.
- **Alternatives:** A repository class per model, wrapped by services.
- **Reason:** With two tables and simple CRUD, a repository layer would be pass-through code. Rule 2 says not to over-engineer.
- **Trade-offs:** If services become large or need alternate storage, extracting repositories will mean a refactor. That should be revisited around V5 or V6.

## ADR-006: Same-origin dev proxy; CSRF posture

- **Problem:** Cookie auth across origins (`:5173` → `:8000`) needs credentialed CORS and is brittle. Cookie auth also raises CSRF concerns.
- **Decision:**
  - The Vite dev server proxies `/api` and `/health` to the backend, so the browser only ever talks to one origin.
  - CORS is still restricted to `CORS_ORIGINS`.
  - CSRF is mitigated by `SameSite=Lax` cookies (cross-site POST, PATCH and DELETE requests don't carry the cookie) and by JSON-only request bodies.
- **Alternatives:** Credentialed CORS everywhere, or a CSRF token (double-submit) right away.
- **Reason:** It is simple and secure for same-site deployment.
- **Trade-offs:** If the frontend and API are ever deployed on different *sites*, the cookie needs `SameSite=None; Secure` and an explicit CSRF token. That is scheduled for the V10 security review.
