# Postshop

Маркетплейс Postshop в одном репозитории: бэкенд, витрина, админка и мобильное
приложение. Ветка `main` — обычный Postshop, без раздела «Товары из Китая». Вторая ветка — `china`.

| Папка | Исходный репозиторий | Ветка | Коммит |
|---|---|---|---|
| `backend/` | postshop_mvp | `fix/qa-report-2026-08` | `f35da4d` |
| `client/` | postshop_client | `fix/qa-report-2026-08` | `c608760` |
| `admin/` | postshop_admin | `fix/qa-report-2026-08` | `c5ccc87` |
| `mobile/` | postshop-app | `feat/sync-with-postshop-2026-08` | `ecd7ead` |

Снимок сделан без истории коммитов. У каждой части свой README и свои команды
запуска.

Секретов в репозитории нет: `backend/.env.example` повторяет рабочий `.env`
с пустыми `DATABASE_URL`, `SECRET_KEY` и `SMS_API_TOKEN`. Скопируйте его в
`backend/.env` и заполните.
