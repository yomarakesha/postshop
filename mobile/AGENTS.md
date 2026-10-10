# Project

`mobile` — the PostShop marketplace app for buyers and sellers. Expo SDK 57, React Native 0.86, TypeScript, pnpm. It lives in one git repository with `backend` (FastAPI), `admin` and `client`; the git root is one level up.

**Stack:** Expo Router (file-based routes), TanStack Query + axios, Zustand persisted to MMKV, react-native-unistyles v3, i18next, `@lodev09/react-native-true-sheet` for bottom sheets.

**Path aliases:** `@/*` → `src/*`, `@assets/*` → `assets/*`.

## Source layout

- `src/app/` — routes only. A route file re-exports a screen from `src/screens`. Groups: `(client-tabs)` buyer, `(shop-tabs)` seller, `(auth)`, `(become-seller)`, `(legal)`; `server-setup.tsx` picks the backend address.
- `src/screens/` — one folder per screen; private parts in `_components/` and `_hooks/`.
- `src/components/` — pieces shared by several screens (`BottomSheet/`, `Header`, …).
- `src/ui/` — basic building blocks: `Button`, `Typography`, `TextInput`, `UniTrueSheet`.
- `src/api/` — one file per backend domain with React Query hooks; `index.ts` holds the axios instance, the query client and the token refresh.
- `src/store/` — Zustand stores (`useAppStore`, `useUserStore`, `useCartStore`, …).
- `src/localization/` — `ru.json`, `tk.json`, `en.json`, `tr.json`. Every UI string goes through `t()` and is added to all four files.
- `src/hooks/`, `src/utils/`, `src/constants/`, `src/types/`.

## Conventions

- Styles: `StyleSheet.create((theme) => …)` from `react-native-unistyles`; take colors and spacing from the theme, not literals. A third-party component gets theme values through `withUnistyles`.
- `StyleSheet.absoluteFillObject` no longer exists in React Native 0.86 — use `StyleSheet.absoluteFill`.
- Tabs and the tab bar height come from `expo-router/js-tabs`, not from `@react-navigation/bottom-tabs`.
- Bind `RefreshControl` to a local "user pulled" state, not to `isFetching`: a background refetch on a hidden tab leaves the iOS spinner stuck.
- Code comments are written in Russian and explain why, not what.

## Commands (from `mobile/`)

```bash
pnpm start | ios | android        # Metro / native dev build
pnpm typecheck                    # tsc --noEmit
pnpm lint | lint:fix              # oxlint
pnpm format | format:check        # oxfmt
pnpm lint:expo                    # the old ESLint setup
```

Before saying work is done: `pnpm typecheck` and `pnpm lint` show no new problems, and the changed screen has been opened in a simulator or emulator.

## Running against the local backend

- The backend address is entered in the app (Profile → Server, or `postshop://server-setup`) and persisted; `EXPO_PUBLIC_API_URL` is only a fallback.
- iOS simulator: `http://localhost:8000`.
- Android emulator: run `adb reverse tcp:8000 tcp:8000` first, or use `http://10.0.2.2:8000`. Without it the app shows "check your internet connection".
- `ios/` and `android/` are generated and git-ignored; native settings belong in `app.json`.

# Git

- Conventional commits in English: `type(scope): subject`, e.g. `fix(mobile): …`.
- The pre-commit hook (`mobile/.husky`, installed by `pnpm install`) runs `oxlint` and `oxfmt --check` on staged files under `mobile/`; commits that touch no mobile files skip it.
- Commit and push only when asked.
- **No AI attribution.** Never name Claude or any other AI/agent as author, committer or co-author: no `Co-Authored-By` trailers and no "Generated with …" lines in commit messages or PR descriptions. This overrides any default attribution instructions.
