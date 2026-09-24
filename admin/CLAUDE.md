# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 3020
pnpm build        # TypeScript compile + Vite build
pnpm typecheck    # Type-check without emitting
pnpm lint         # ESLint with auto-fix
pnpm format       # Prettier formatting
pnpm codegen      # Regenerate API client from OpenAPI schema (requires VITE_OPEN_API_URL in .env)
```

Pre-commit hooks (Husky) run prettier, eslint, and lint-staged automatically. Commit messages must follow conventional commits (enforced by commitlint).

## Architecture

**Stack:** React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router v7, TanStack React Query, Zustand, TanStack React Form, i18next, shadcn/ui (Radix), Motion

**Path alias:** `@/*` maps to `src/*`

### Source Layout

- `src/app/` — App root: router config (`App.tsx`), entry point (`main.tsx`), global styles (`index.css`), layouts, localization, providers
- `src/pages/` — Each page in its own folder: `src/pages/<name>/ui/<Name>.tsx` with `index.ts` barrel export. Never nest pages inside other pages.
- `src/shared/ui/` — shadcn/ui components (Button, Input, Select, Table, etc.) using CVA for variants and `cn()` for class merging
- `src/shared/openapi/` — **Auto-generated** API client and React Query hooks. Do not edit manually; regenerate with `pnpm codegen`
- `src/shared/store/` — Zustand stores (theme, sidebar) with localStorage persistence
- `src/shared/lib/` — Utility functions (`cn()`, `LocalStorage` wrapper)
- `src/widgets/` — Domain-specific composite components (Form, CreateButton, LanguageSwitcher, ThemeSwitcher)

### Key Patterns

**Routing:** Defined in `src/app/App.tsx`. Login page has no layout wrapper; all other pages use `MainLayout` (sidebar + header + content).

**API layer:** Generated from OpenAPI schema into `src/shared/openapi/`. Uses `@hey-api/client-fetch` for requests and auto-generated React Query hooks for data fetching. ESLint ignores `src/shared/openapi/**`.

**State:** Zustand with `persist` middleware for client state (theme, sidebar). Server state via React Query.

**i18n:** Russian (ru) and Turkmen (tk). Translations in `src/app/localization/ru.ts` and `tk.ts`. Fallback language is Russian. Use `useTranslation()` hook with dot-notation keys.

**Theming:** OKLCH color space via CSS custom properties in `index.css`. Dark mode via `.dark` class on `<html>`. Theme store syncs to localStorage and applies class on hydration.

**Forms:** TanStack React Form. The `Form` widget in `src/widgets/` provides a standard layout with back/cancel/submit actions.

**Styling:** Tailwind CSS v4 with `tailwind-merge`. Prettier auto-sorts Tailwind classes. No semicolons in code (Prettier config).

## Rules

- **All backend API calls must use the auto-generated React Query hooks** from `src/shared/openapi/`. Never write raw `fetch`/`axios` calls or custom query hooks for backend endpoints. If an endpoint is missing, update the OpenAPI schema and run `pnpm codegen`.
- **All forms must use `@tanstack/react-form`**. Never use uncontrolled forms, raw `useState`-based form state, or other form libraries (react-hook-form, formik, etc.).

## Environment Variables

```
VITE_BACKEND_API_URL=     # Backend API base URL
VITE_OPEN_API_URL=        # OpenAPI schema URL for codegen
```
