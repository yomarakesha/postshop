# Выкладка Postshop на shop.post.tm

Состояние на 07.10.2026.

## Схема

```
Интернет ──HTTPS──▶ nginx (shop.post.tm, сертификат *.post.tm)
                     ├── /           → 127.0.0.1:7001  витрина   (pm2: postshop-client, vite preview, SSR)
                     ├── /admin/     → 127.0.0.1:7003  админка   (pm2: postshop-admin,  vite preview)
                     ├── /api/       → 127.0.0.1:7002  бэкенд    (pm2: postshop-mvp,    uvicorn), префикс /api срезается
                     └── /uploads/   → 127.0.0.1:7002/uploads/   картинки, логотипы, документы
          ──HTTP:8082─▶ 127.0.0.1:7002  API для мобильного приложения (как было)
```

- Сервер: `ssh postshop` (shop.post.tm, пользователь `ubuntu`, порт 51271).
- Код: `/opt/postshop/{mvp,client,admin}` — бэкенд, витрина, админка.
- Процессы: pm2 пользователя `ubuntu`, автозапуск через `pm2-ubuntu.service`.
- База: MySQL `marketplace`, доступ — в `/opt/postshop/mvp/.env`.
- Сертификат: `/var/www/ssl/2026/` — wildcard `*.post.tm` (Sectigo), действует до 23.01.2027.
  Покрывает `shop.post.tm`, но **не** `www.shop.post.tm`: `http://www` перенаправляет на
  `https://shop.post.tm`, а `https://www` браузер покажет с ошибкой сертификата.

## Прежний сайт (Laravel + Next.js)

Выключен из nginx 07.10.2026, на сервере оставлен как есть:
файлы в `/var/www/postshop`, PostgreSQL, процесс `postshop-frontend` (pm2 root, порт 3000).
Его блок nginx: `/etc/nginx/conf.d/default.conf.disabled-old`.

Вернуть прежний сайт на домен:

```bash
cd /etc/nginx/conf.d
sudo mv postshop.conf postshop.conf.disabled
sudo mv default.conf.disabled-old default.conf
sudo nginx -t && sudo systemctl reload nginx
```

## Файлы конфигурации

| Файл | Что задаёт |
|---|---|
| `/etc/nginx/conf.d/postshop.conf` | домен, SSL, маршруты /, /admin/, /api/, /uploads/, порт 8082 |
| `/opt/postshop/mvp/.env` | база, ключ токенов, SMS, `FBS_ENABLED` (склад платформы) |
| `/opt/postshop/client/.env` | `VITE_BACKEND_API_URL=/api`, `PREVIEW_ALLOWED_HOSTS=shop.post.tm,www.shop.post.tm` |
| `/opt/postshop/admin/.env` | `VITE_BACKEND_API_URL=/api`, `VITE_BASE_PATH=/admin/`, `PREVIEW_ALLOWED_HOSTS=…` |

- `VITE_BASE_PATH=/admin/` — админка собрана под путём `/admin/`. Без него ссылки и ассеты
  вели бы в корень домена — на витрину.
- `PREVIEW_ALLOWED_HOSTS` — `vite preview` отвечает только на перечисленные имена; без домена
  в списке — 403 «Blocked request». Меняется без пересборки: `pm2 restart …`.
- Токены админки хранятся с префиксом `postshop_admin:` — у админки и витрины один домен и
  общий `localStorage`.

## Выкладка новой версии

Сервер без доступа в интернет: `git pull`, `pip install`, `pnpm install` там не работают.
Код переносится файлами; если меняются зависимости — пакеты нужно везти отдельно.

```bash
# 0. Бэкап (обязательно перед миграциями)
ssh postshop
B=/opt/postshop-backups/$(date +%Y-%m-%d_%H%M); mkdir -p $B
mysqldump -u postshop -p marketplace > $B/marketplace.sql       # пароль — в mvp/.env
tar czf $B/postshop_code_uploads.tgz -C /opt --exclude=node_modules --exclude=.venv \
    --exclude='*/dist' --exclude='*/.output' postshop

# 1. С ноутбука: изменённые файлы (пример — всё изменённое с коммита X)
cd ~/projects/postshop-all
git diff --name-only X HEAD -- backend | sed 's#^backend/##' > /tmp/list.txt
git archive HEAD backend | tar x -C /tmp/deploy && (cd /tmp/deploy/backend && tar czf - -T /tmp/list.txt) \
    | ssh postshop 'tar xzf - -C /opt/postshop/mvp'
# то же для client → /opt/postshop/client и admin → /opt/postshop/admin

# 2. На сервере: бэкенд
cd /opt/postshop/mvp
.venv/bin/alembic upgrade head
.venv/bin/python scripts/seed_permissions.py
pm2 restart postshop-mvp

# 3. На сервере: витрина и админка
cd /opt/postshop/client && pnpm build && pm2 restart postshop-client
cd /opt/postshop/admin  && pnpm build && pm2 restart postshop-admin

# 4. Проверка
curl -s -o /dev/null -w '%{http_code}\n' https://shop.post.tm/
curl -s -o /dev/null -w '%{http_code}\n' https://shop.post.tm/admin/
curl -s -o /dev/null -w '%{http_code}\n' https://shop.post.tm/api/order-statuses/
```

## Повседневные команды

```bash
pm2 list                          # состояние трёх процессов
pm2 logs postshop-mvp             # журнал бэкенда (там же коды из SMS при SMS_ENABLED=false)
pm2 restart postshop-client       # перезапуск витрины
sudo nginx -t && sudo systemctl reload nginx   # после правки nginx
sudo tail -f /var/log/nginx/error.log
```

## Откат выкладки 06.10

Бэкап до выкладки: `/opt/postshop-backups/2026-10-06_1520`
(`marketplace.sql` — база на ревизии `b4e8f2a6c913`, `postshop_code_uploads.tgz` — код и uploads).
Бэкап nginx: `/opt/postshop-backups/nginx_2026-10-07_0409`.

```bash
cd /opt/postshop/mvp && .venv/bin/alembic downgrade b4e8f2a6c913
# вернуть код из postshop_code_uploads.tgz, затем pnpm build витрины и админки
pm2 restart all
```

Данные, появившиеся после выкладки (отметки оплаты, суммы возвратов, заявки на вывоз),
при откате пропадут.
