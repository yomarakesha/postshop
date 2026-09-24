# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm dev` (port 3000)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` (runs eslint with --fix)
- **Format**: `pnpm format` (prettier on all ts/tsx files)
- **Test**: `pnpm vitest` (or `pnpm vitest run` for single run, `pnpm vitest src/path/to/file` for single file)

## Architecture

**TanStack Start** app with React 19, TypeScript, Vite 7, and SSR support.

### Routing

File-based routing via TanStack Router. Routes live in `src/routes/` and are auto-compiled into `src/routeTree.gen.ts` (read-only, never edit). The root layout in `src/routes/__root.tsx` defines the HTML shell and wraps all routes with providers/devtools.

### Data Fetching

TanStack React Query for server state. The `queryClient` is created in the root route context and available to all routes via `routeContext`. SSR query integration is enabled via `@tanstack/react-router-ssr-query`.

### Styling

Tailwind CSS 4 via `@tailwindcss/vite` plugin. Single entry point at `src/styles.css`. Typography plugin available.

### Path Aliases

- `#/*` and `@/*` both resolve to `src/*`

### Key Libraries

- **Forms**: @tanstack/react-form
- **Validation**: zod
- **Icons**: lucide-react

### API & Data Fetching Rules

- **Always use generated hooks** from `src/shared/openapi/queries/` for all API calls (queries, mutations, suspense, infinite queries, prefetching)
- **Never write manual `useQuery`/`useMutation` calls** or raw `fetch`/`axios` requests for API endpoints — the generated hooks from openapi-codegen handle this
- Generated request types and services live in `src/shared/openapi/requests/`
- If an endpoint is missing, regenerate the openapi client instead of writing manual API calls

## Code Style

- No semicolons, single quotes, trailing commas, 2-space indent, 100 char width
- ESLint uses @tanstack/eslint-config with all rules set to warn level
- Conventional commits enforced via commitlint (husky commit-msg hook)
- Pre-commit hook runs format, lint, and lint-staged
