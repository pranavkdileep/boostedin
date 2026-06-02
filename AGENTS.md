<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version is Next.js 16 and has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Notable v16 changes that affect this repo:
- `middleware.ts` is gone — use `proxy.ts` at the project root, exporting a `proxy(request)` function and a `config.matcher`.
- `cookies()`, `headers()`, `params`, and `searchParams` are async — always `await` them.
- See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` for the proxy API and `01-app/01-getting-started/16-proxy.md` for usage.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS v4.
- MongoDB 7 (via `docker-compose.yml`) for persistence; `jsonwebtoken` for sessions; custom AES-256-CBC for at-rest encryption of LinkedIn tokens.
- Single-package repo. No monorepo tooling. Path alias `@/*` → `./*` (see `tsconfig.json`).

## Commands

- `npm run dev` — start Next dev server.
- `npm run build` — production build.
- `npm run start` — run the built app.
- `npm run lint` — ESLint (uses `eslint-config-next` core-web-vitals + typescript presets).
- `npx tsc --noEmit` — typecheck. There is no `typecheck` script; run it explicitly. The repo currently has no test suite.
- `docker compose up -d` — start MongoDB (required for any flow that touches `lib/db/db.ts`, including the auth callback and the health route at `/api/health`).

## Local environment

Real config lives in `.env.local` (gitignored). Required keys (see `lib/db/db.ts`, `actions/security/aes.ts`, `actions/auth/login.ts`, `lib/auth/session.ts`):
- `MONGODB_URI`, `MONGO_DB_NAME`
- `JWT_SECRET_KEY` — HS256 secret for the `session` cookie.
- `AES_SECRET_KEY` — SHA-256 hashed at runtime to derive the AES-256 key.
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

Without these, the corresponding module throws on first import. Do not import those modules from client code.

## Auth flow (custom, NOT next-auth)

`next-auth` is installed as a dependency but unused. Do not add next-auth routes/providers — the auth flow is hand-rolled:

- `actions/auth/login.ts` exports `signInWithLinkedIn()` (server action), `handleLinkedInCallback(code, state)`, and `verifyUser(cookieValue)`.
- Server action sets a 32‑byte `state` in the `linkedin_oauth_state` cookie (10 min) and redirects to LinkedIn with scopes `openid profile email`.
- Callback at `app/api/auth/linkedin/callback/route.ts` validates state, exchanges code, calls `https://api.linkedin.com/v2/userinfo`, encrypts the access token with `actions/security/aes.ts`, upserts the user in the `users` collection (matched by `email`), and signs a JWT into the `session` cookie (7 days, `httpOnly`, `sameSite=lax`, `secure` in production).
- Successful login redirects to `/dash`. Errors redirect to `/auth?error=…`.
- `proxy.ts` (root) protects `/dash/*` (redirects unauthenticated users to `/auth?redirect=<path>`) and bounces authenticated users away from `/auth`. Uses the matcher `"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"`.
- `lib/auth/session.ts` exposes a lightweight `verifyToken` (no DB) for use in `proxy.ts`. `verifyUser` in `actions/auth/login.ts` adds a Mongo lookup — use it from server components / route handlers, not from proxy.

## Conventions

- **Tailwind v4**: no `tailwind.config.js`. Design tokens (colors, typography sizes, spacing, radii, shadows) are defined in `app/globals.css` inside the `@theme` block. Custom classes like `font-headline-md`, `text-body-lg`, `bg-purple-gradient`, `text-purple-gradient`, `glass`, and animations (`animate-blob`, `animate-float`, `animate-fade-in-*`, `animate-shake`, `animate-gradient-rotate`, etc.) are available globally. Add new design tokens there, not in a config file.
- **Server actions**: must be async, must start with `"use server"` either at the top of the function body or at the top of the file. `actions/auth/login.ts` mixes both styles — top-of-file `"use server"` covers the whole module, while function-level `"use server"` is used inside `signInWithLinkedIn` only.
- **Client components**: opt in with `"use client"` at the top of the file. Pages that read `useSearchParams` (e.g. `app/auth/page.tsx`) must be wrapped in a `<Suspense>` boundary or built/render will fail.
- **Mongo `_id`**: the `User` type uses `string` for `_id` (see `lib/types/user.ts`). New users get a random hex string, not an ObjectId. Query `findOne({ _id: userId })` with the string value.
- **No test framework is set up.** Don't introduce Vitest/Jest etc. without being asked.
- **No prettier / format command.** Match the existing two-space indent, double-quoted strings, and trailing-semi style.

## Layout quick map

- `app/` — App Router pages and route handlers. Top-level public pages: `/` (home), `/auth` (LinkedIn sign-in). Protected app: `/dash`, `/dash/settings`.
- `actions/auth/login.ts` — server actions for LinkedIn OAuth.
- `actions/security/aes.ts` — symmetric encrypt/decrypt for tokens at rest.
- `lib/db/db.ts` — singleton MongoDB client (uses `globalThis` to survive HMR).
- `lib/auth/session.ts` — JWT verify helper for proxy.
- `lib/types/user.ts` — `User` / `LinkedInProfile` / `NotificationSettings` shapes.
- `components/` — `Header`, `Footer`, `components/dashboard/DashboardShell.tsx` (sidebar + sticky header used by `/dash/*`).
- `proxy.ts` — auth gate at the project root.
- `mongo-init/` — mounted into Mongo as `/docker-entrypoint-initdb.d`; currently empty.
- `DESIGN.md` — frontmatter design tokens that mirror the Tailwind v4 theme; keep them in sync if you add colors/typography.

## Verification before finishing

Run, in order, after any code change:
1. `npm run lint`
2. `npx tsc --noEmit`
3. (manual) `npm run dev` and exercise the touched route, including the auth callback if you touched it (you'll need Mongo up and a real LinkedIn `code` for a full end-to-end test).
