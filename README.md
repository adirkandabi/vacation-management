# Vacation Management (Vue + Node + Postgres + TypeORM)

Web application for submitting and validating vacation requests.

## Prerequisites
- Node.js (recommended: v22+)
- Docker Desktop (for PostgreSQL)

## Quick start (local)

### 1) Start PostgreSQL
From the repository root:

```bash
docker compose up -d
```

This starts a Postgres container exposed on `localhost:5432`.

### 2) Start the backend (Node/Express)

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

- On startup, TypeORM connects and **auto-creates tables** (dev-only) and **seeds 3 users** if the DB is empty:
  - 2 requesters
  - 1 validator

### 3) Start the frontend (Vue)

```bash
cd client
npm install
npm run dev
```

Frontend runs on the Vite dev server (it will print the URL).

## How “login” works in this demo (no passwords)
To keep the scope aligned with the assignment (no auth requirements were provided), the backend identifies the acting user via an HTTP header:

- `X-User-Id: <number>`

### Requester screen
- Go to `/requester`
- Enter a seeded **Requester** id (1 or 2) and click **Set & Load**
- All requester actions (list/create/delete pending) will be sent with that `X-User-Id`

### Validator screen
- Go to `/validator`
- The UI **auto-detects** the validator user (and caches it), so no manual id input is needed
- Validator can view all requests and approve/reject
- Reject requires a non-empty comment (enforced by both UI and API)

> Note: This is **not secure authentication**. It is a lightweight demo identity mechanism to demonstrate RBAC behavior.

## API (backend)
Base URL: `http://localhost:3000`

### Users
- `GET /api/users` (validator: all users; requester: returns only self)
- `GET /api/users/:id` (validator: any; requester: only self)

### Vacation Requests
- `GET /api/vacation-requests`
  - Validator: all requests (optional `?status=Pending|Approved|Rejected`, `?userId=<id>`)
  - Requester: only own requests (ignores `userId` filter)
- `POST /api/vacation-requests` (requester only; can create only for self)
- `PATCH /api/vacation-requests/:id` (requester only; only own + only Pending)
- `DELETE /api/vacation-requests/:id` (requester only; only own + only Pending)
- `POST /api/vacation-requests/:id/approve` (validator only; only Pending)
- `POST /api/vacation-requests/:id/reject` (validator only; only Pending; requires `comments`)

## Tests

### Server
From `server/`:

```bash
npm test
```

This runs Vitest unit tests + integration tests (integration tests require PostgreSQL running).

### Client
From `client/`:

```bash
npm test
```

This runs **Vitest** unit tests only (no browser, no database). Tests cover the main screen logic in composables (`useRequester`, `useValidator`) with mocked API modules.

For watch mode during development:

```bash
cd client
npm run test:watch
```

## Tech decisions (brief)
- **Express + TypeScript**: simple REST API with centralized async/error handling.
- **TypeORM + PostgreSQL**: entities for `User` and `VacationRequest`.
- **Dev schema management**: TypeORM `synchronize` enabled by default for local development (fast iteration). For production, migrations should be used instead.
- **Seeding**: on startup, seed users only when the `users` table is empty.
- **RBAC**: role checks are enforced on the server:
  - Validator can view/approve/reject all requests
  - Requester can view/create/update/delete only their own requests (and only while Pending for update/delete)
- **Frontend**: Vue 3 + Vue Router + Axios with a shared client instance and `X-User-Id` header switching per screen.
- **Client testability**: requester/validator workflows live in composables (`src/composables/*.ts`) so unit tests can target TypeScript without mounting full `.vue` pages.

## Reset database (delete all data)
From repository root:

```bash
docker compose down -v
docker compose up -d
```

Then restart the backend to recreate tables and re-seed users.

