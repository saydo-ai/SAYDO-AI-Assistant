# SAYDO

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/saydo/` — MVP interface and architecture overview
- `artifacts/api-server/` — shared API service (not used by the demo flow)
- `lib/api-spec/openapi.yaml` — shared API contract

## Architecture decisions

- The initial request-to-action flow is a frontend-only simulation; it does not call an AI model or external service.
- Keep the review/approval boundary explicit before any future action execution.
- Do not connect external accounts, request sensitive permissions, or add paid services without the user's confirmation.

## Product

- Users can enter a natural-language request, review a proposed action, and see a simulated outcome.
- The architecture overview explains request → intent parsing → action planning → approval gate → connector execution.
- No real external action is executed in the MVP.

## User preferences

- Keep the MVP architecture and interface simple.
- Do not add paid services or make purchases.
- Ask for confirmation before connecting external accounts or requesting sensitive permissions.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
