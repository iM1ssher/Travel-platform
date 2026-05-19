# Codex Instructions for Travel Platform

## Project Context

This repository is a travel platform built with Next.js 16.2.5, React 19, TypeScript, Prisma 7, PostgreSQL, Tailwind CSS 4, Framer Motion, and lucide-react.

Primary app areas:

- `app/page.tsx`: public landing and trip browsing experience.
- `app/trip/[id]/page.tsx`: public trip detail page.
- `app/planner/dashboard/page.tsx`: planner dashboard.
- `app/traveler/dashboard/page.tsx`: traveler dashboard.
- `app/admin/dashboard/page.tsx`: admin dashboard.
- `app/api/**/route.ts`: API route handlers.
- `lib/auth.ts`: password hashing, session cookie helpers, shared auth responses.
- `lib/session.ts`: reads the current user from cookies.
- `lib/prisma.ts`: Prisma client setup using `@prisma/adapter-pg`.
- `prisma/schema.prisma`: database schema.

Use Traditional Chinese for user-facing copy unless the surrounding file clearly uses English.

## Mandatory Next.js Rule

This is Next.js 16.2.5. Do not rely on memory from older Next.js versions.

Before editing Next.js code, read the relevant local documentation under:

```text
node_modules/next/dist/docs/
```

Examples:

- Route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Authentication: `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- Server/client components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Data fetching: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Mutating data: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`

Follow deprecation notices and current conventions from those docs.

## Working Rules

- Inspect existing patterns before changing code.
- Keep changes scoped to the requested behavior.
- Do not rewrite unrelated UI, data models, migrations, or generated files.
- Do not edit `node_modules`, `.next`, `package-lock.json`, or Prisma migrations unless the task explicitly requires it.
- Check `git status --short` before and after changes.
- Preserve user changes already present in the working tree.
- Prefer type-safe Prisma types over `any`.
- Prefer existing helpers in `lib/auth.ts`, `lib/session.ts`, and `lib/prisma.ts` instead of duplicating logic.
- Do not add dependencies unless the task clearly needs them.

## Commands

Use these commands from the repository root:

```bash
npm run dev
npm run build
npm run lint
npx prisma validate
```

Useful Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

Run `npx prisma validate` after schema changes. Run `npm run build` before finishing substantial changes. Run `npm run lint` when touching TypeScript or React code; if unrelated existing lint failures remain, report them clearly.

## Auth and Security Requirements

Treat auth and authorization as high-risk areas.

- Never trust client-provided role, email, user id, or cookie content without server verification.
- API routes that mutate data must require a valid session.
- Admin routes must check `session.role === "admin"` on the server.
- Planner-only trip creation or editing must check `session.role === "planner"` and ownership.
- Public trip reads should not expose drafts unless the current user owns the draft or is an admin.
- Seed routes must not be publicly usable in production.
- Do not introduce hard-coded production credentials.
- Keep `.env` out of responses and commits.

Known current risks to handle carefully when working in this area:

- `aiTravelSession` is currently plain encoded JSON. Prefer replacing it with a signed/encrypted cookie or opaque server-side session id.
- `app/api/seed/route.ts` and `app/api/trips/seed/route.ts` are seed endpoints and should be guarded or removed for production usage.
- Seeded users should use the same password hashing helper as login verification.

## API Route Handler Guidance

- Use `NextResponse.json(...)` consistently.
- Validate request JSON and query parameters before using them.
- Convert ids with `parseInt(value, 10)` or `Number(...)`, then reject `NaN`.
- Return appropriate statuses: `400` invalid input, `401` unauthenticated, `403` authenticated but forbidden, `404` missing resource, `409` conflict.
- Avoid broad `include` unless the API response needs every relation field.
- Keep route handler responses stable for existing frontend callers.

## Prisma Guidance

- Keep schema changes intentional and paired with migrations.
- Use `select` for public APIs to avoid leaking sensitive fields such as `password`.
- Use transactions when multiple writes must succeed or fail together.
- Recalculate denormalized fields like `averageRating` and `reviewCount` after review mutations.
- Do not use `deleteMany`, `updateMany`, or destructive seed logic without an explicit guard.

## Frontend Guidance

- Existing UI uses Tailwind utility classes, Framer Motion, and lucide-react icons.
- Keep pages usable as app screens, not marketing-only landing pages.
- Preserve role-based flows for traveler, planner, and admin users.
- For icons, prefer lucide-react icons already used in the project.
- Avoid adding visible instructional text that explains the UI mechanics unless the feature requires it.
- Ensure mobile layouts do not overlap and buttons/text fit their containers.
- Prefer `next/image` over raw `<img>` when changing image-heavy UI, unless there is a clear reason not to.

## Quality Bar

Before final response:

- Summarize what changed and where.
- Report verification commands and results.
- If a command fails, include the relevant reason and whether it appears related to the change.
- Mention remaining risks only when they affect the user request.

