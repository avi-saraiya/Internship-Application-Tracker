# Internship Application Tracker

A full-stack web app for tracking software-engineering internship applications through the recruiting pipeline. It is built as a production-style portfolio project and developed incrementally, version by version.

**Current status:** MVP. Accounts (register/login/logout), per-user application CRUD, and a dashboard with status counts.

## Stack

| Layer    | Tech                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS v4       |
| Backend  | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic                      |
| Database | PostgreSQL 16                                                                   |
| Auth     | Server-side sessions in an HttpOnly cookie, argon2 password hashing             |
| Testing  | pytest (against real Postgres), Vitest + React Testing Library                  |
| Dev      | Docker Compose, ruff, oxlint, Prettier                                          |

## Architecture

```text
Browser ──► Vite dev server :5173 ──(proxy /api, /health)──► FastAPI :8000 ──► PostgreSQL :5432
```

The frontend and API are served from one origin (via the proxy), so the session cookie works without cross-origin configuration. Design decisions are recorded in [`docs/decisions.md`](docs/decisions.md).

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- App: http://localhost:5173
- API docs (Swagger): http://localhost:8000/docs
- Health: http://localhost:8000/health returns `{"status":"ok"}`

Migrations run automatically when the backend container starts.

## Native development

The database still runs in Docker:

```bash
cp .env.example .env
docker compose up -d db

# Backend
cd backend
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements-dev.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Environment variables

See [`.env.example`](.env.example).

| Variable                | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `POSTGRES_*`            | Credentials for the Postgres container                       |
| `DATABASE_URL`          | SQLAlchemy URL for the app database                          |
| `TEST_DATABASE_URL`     | Database used by pytest (must be named `tracker_test`)       |
| `SESSION_COOKIE_SECURE` | `true` when served over HTTPS                                |
| `SESSION_TTL_HOURS`     | Session lifetime (default 168 = 7 days)                      |
| `CORS_ORIGINS`          | Comma-separated allowed browser origins                      |
| `LOG_LEVEL`             | Python log level (JSON-structured output)                    |

## API (v1)

| Method | Path                            | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| GET    | `/health`                       | Liveness + DB connectivity           |
| POST   | `/api/v1/auth/register`         | Create account and start session     |
| POST   | `/api/v1/auth/login`            | Start session                        |
| POST   | `/api/v1/auth/logout`           | End session                          |
| GET    | `/api/v1/auth/me`               | Current user                         |
| GET    | `/api/v1/applications`          | List your applications               |
| POST   | `/api/v1/applications`          | Create                               |
| GET    | `/api/v1/applications/summary`  | Counts by status (dashboard)         |
| GET    | `/api/v1/applications/{id}`     | Fetch one                            |
| PATCH  | `/api/v1/applications/{id}`     | Partial update                       |
| DELETE | `/api/v1/applications/{id}`     | Delete                               |

Every application endpoint is scoped to the logged-in user. Another user's ids return `404`.

## Testing

```bash
# Backend (needs the db container running)
cd backend && .venv/bin/pytest
#   or inside Docker:  docker compose exec backend pytest

# Frontend
cd frontend && npm test
```

Linting and formatting: `ruff check . && ruff format --check .` in the backend; `npm run lint && npm run format:check` in the frontend.
