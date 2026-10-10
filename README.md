# Linkly

A small, self-hostable **URL shortener API** built with TypeScript, Express 5 and Zod.

This repository is also used as a playground for evaluating AI code review on real
pull requests (see the open/closed PRs for examples of feature, security, bug-fix and
refactor changes).

## Features

- Create short links with generated or custom aliases
- Optional expiry (`expiresInDays`) — expired links return `410 Gone`
- Click counting on redirect
- JSON error envelope with validation details
- Fully tested with Vitest + Supertest, CI on GitHub Actions

## Quick start

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:3000
```

```bash
npm test             # run the test suite
npm run typecheck    # strict TypeScript check
npm run build && npm start
```

## API

| Method | Path               | Description                     |
| ------ | ------------------ | ------------------------------- |
| GET    | `/health`          | Liveness check                  |
| GET    | `/api/links`       | List links (newest first)       |
| POST   | `/api/links`       | Create a link                   |
| GET    | `/api/links/:code` | Get one link                    |
| DELETE | `/api/links/:code` | Delete a link                   |
| GET    | `/:code`           | Redirect to the target URL      |

### Create a link

```bash
curl -X POST http://localhost:3000/api/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://github.com","alias":"gh","expiresInDays":30}'
```

```json
{
  "data": {
    "code": "gh",
    "targetUrl": "https://github.com",
    "createdAt": "2026-10-11T10:00:00.000Z",
    "expiresAt": "2026-11-10T10:00:00.000Z",
    "clicks": 0,
    "shortUrl": "http://localhost:3000/gh"
  }
}
```

### Errors

```json
{ "error": { "code": "conflict", "message": "Alias \"gh\" is already taken" } }
```

## Configuration

| Variable      | Default                  | Description               |
| ------------- | ------------------------ | ------------------------- |
| `PORT`        | `3000`                   | HTTP port                 |
| `BASE_URL`    | `http://localhost:$PORT` | Used to build `shortUrl`  |
| `CODE_LENGTH` | `7`                      | Length of generated codes |
| `API_KEYS`    | _(empty)_                | Comma-separated keys required for `POST`/`DELETE` via `x-api-key`. Empty disables auth. |
| `RATE_LIMIT_WINDOW_MS` | `60000`         | Rate-limit window for link creation |
| `RATE_LIMIT_MAX` | `30`                  | Max link creations per IP per window |

## Project layout

```
src/
  app.ts              # express app factory (dependency-injected for tests)
  server.ts           # entrypoint
  config.ts           # env parsing
  routes/             # HTTP layer
  services/           # business logic
  store/              # persistence (in-memory for now)
  middleware/         # error handling
  utils/              # code generator, http errors
tests/                # vitest + supertest
```

## License

MIT © Krishnendu Ghosal
