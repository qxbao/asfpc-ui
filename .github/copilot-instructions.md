# ASFPC — Copilot instructions (concise)

This repo is part of a dual-workspace app: the Next.js frontend (`asfpc-ui/`) and the Go backend + Python automation in the sibling `asfpc-go/` folder. Keep the two in mind when making changes.

Quick facts and where to look (examples):
- Frontend: Next.js (app router) + TypeScript + Material‑UI. Key dirs: `src/app/(dashboard)/`, `src/components/`, `src/redux/` (store, slices, `src/redux/api/`).
- Backend: Go services and SQLC-generated DB layer live in `../asfpc-go/` (eg `asfpc-go/server/`, `asfpc-go/infras/`, `asfpc-go/db/`). Python browser automation lives in `asfpc-go/python/`.

Essential dev commands (where to run them):
- Frontend dev: in `asfpc-ui/` run `pnpm dev --turbopack` (uses Next.js turbopack).
- Backend dev: in `asfpc-go/` run `.\dev.ps1` (loads .env and starts `air` hot-reload). Python venv helper: `asfpc-go/venv.ps1`.
- Regenerate Go DB types: run `sqlc generate` from `asfpc-go/` after editing `asfpc-go/db/sql/query.sql`.

Project-specific conventions to follow:
- RTK Query pattern: endpoints live in `src/redux/api/*`. Use the project's `custom.ts` baseQuery and tag-based invalidation.
- Pages use Next.js App Router under `src/app/(dashboard)/` and feature pages under `src/components/pages/`.
- Service layer (Go): put HTTP handlers in `asfpc-go/server/` and business logic in `asfpc-go/infras/` or `asfpc-go/services/`. Services receive `*infras.Server` to access DB and config.
- Python automation: scripts in `asfpc-go/python/` are invoked by Go (see `asfpc-go/services/python.go`); expect file-based inputs/outputs and persistent browser profiles in `asfpc-go/python/resources/user_data_dir/`.

Integration and data flow notes (concrete):
- Frontend ↔ Backend: backend base URL read from `NEXT_PUBLIC_BACKEND_URL`. APIs implemented in Go return structured JSON and rely on cookie auth (cookies are stored in the DB `account.cookies` JSON field).
- DB: schema is in `asfpc-go/db/sql/schema.sql`. SQLC generates `asfpc-go/db/query.sql.go` — edit SQL files, then `sqlc generate`.
- Logging & debugging: Go logs and build errors land in `asfpc-go/tmp/` (see `build-errors.log`), and Python automation writes logs to `asfpc-go/python/logs/`.

If you add something, follow these minimal steps:
1. For new backend endpoints: add route in `asfpc-go/server/` → implement in `asfpc-go/infras/` or `asfpc-go/services/` → update frontend RTK Query in `src/redux/api/`.
2. For DB changes: update `asfpc-go/db/sql/query.sql` & `schema.sql`, run `sqlc generate`, run tests or start backend to validate.
3. For UI work: prefer Material‑UI components in `src/components/ui/` and share state via `src/redux/slices/`.

Files to open first when onboarding an AI agent:
- `asfpc-go/server/server.go`, `asfpc-go/infras/server.go` (bootstrap & DI)
- `asfpc-go/db/sql/query.sql`, `asfpc-go/db/sql/schema.sql` (DB contract)
- `asfpc-go/python/browser/facebook.py` (automation pattern)
- `asfpc-ui/src/redux/api/custom.ts` and a sample endpoint in `src/redux/api/account.api.ts` (how frontend calls backend)

Feedback request: review any sections that are unclear or missing (deploy, CI, secrets) and I will iterate. Keep edits short and reference the exact file paths above.