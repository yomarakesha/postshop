# Заказы — API-референс для фронтенда

Полный справочник по заказам: жизненный цикл, все роуты, тела запросов, форма ответа
и что рисовать на фронте. Единственный источник истины по этой части API
(бывший PDF `postshop-orders-api.pdf` удалён, его содержимое перенесено сюда).

- Базовый префикс: `/orders` (справочник статусов — `/order-statuses`).
- Авторизация: `Bearer <JWT>` во всех роутах, кроме публичного справочника статусов.

## Два уровня статуса

Заказ покупателя **распадается на части по магазинам**: при оформлении корзина
группируется по магазину товара, на каждый магазин создаётся суб-заказ `OrderShop`
со своими позициями. Поэтому статусов два:

| Уровень | Где хранится | Кто меняет | Enum |
|---------|--------------|-----------|------|
| **Глобальный** статус заказа | `orders.order_status_id` → таблица `order_statuses` | только админ, вручную | `OrderStatusCode` |
| **Локальный** статус части (суб-заказа) | `order_shops.status` | магазин (продавец) | `LocalOrderStatusCode` |

**Глобальный** (`OrderStatusCode`): `pending`, `approved`, `ready_to_take`, `ready_to_deliver`, `completed`, `rejected`.

**Локальный** (`LocalOrderStatusCode`): `pending`, `approved`, `ready_to_take`, `rejected`.

Один заказ = 1 строка `orders` + N строк `order_shops` (по одной на каждый магазин, чьи товары есть в заказе) + строки `order_items` (каждая привязана и к заказу, и к своему `order_shop`).

Никакой автоматики от локальных статусов: система лишь отдаёт их в ответе
(`order_shops[]`) и подсказки-флаги, решение принимает админ.

---

## Жизненный цикл

1. Покупатель оформляет заказ (`POST /orders/`) → глобальный статус `pending`, у каждого магазина локальный `pending`. Корзина очищается, цены фиксируются в `price_at_order` на момент оформления.
2. Админ глобально одобряет заказ: `pending → approved`. Только теперь заказ «разослан» по магазинам. При одобрении заказа с `delivery_address` админ обязан передать `delivery_price` (для самовывоза через `pickup_point` цена не применима и остаётся `null`).
3. Пока заказ `approved`, каждый магазин независимо двигает свою часть: `pending → approved → ready_to_take` (или `rejected`).
4. Когда все неотклонённые магазины в `ready_to_take`, админ переводит заказ `approved → ready_to_take`, далее вручную `ready_to_deliver → completed`. На `completed` проданный товар списывается со склада: у FBS — из остатков магазина, у FBO — со складов платформы.
5. Пока заказ `pending` или `approved`, покупатель может сам отменить его (`POST /orders/{id}/cancel`) — заказ уходит в `rejected` с пометкой «Отменён покупателем» в `comment`.

**Частичное выполнение:** отказ одного магазина не валит весь заказ — его позиции просто выпадают из суммы к оплате (`effective_total`). Автоматики «все магазины готовы → заказ готов» нет: бэкенд отдаёт локальные статусы и подсказки (`all_active_shops_ready`), а решение принимает админ.

### Переходы глобального статуса

```
pending          → approved | rejected
approved         → ready_to_take | rejected
ready_to_take    → ready_to_deliver | rejected
ready_to_deliver → completed | rejected
rejected         → (терминальный)
completed        → (терминальный)
```

Гард на `ready_to_take`: перевод запрещён, пока **все неотклонённые** магазины не в `ready_to_take` (и хотя бы один активен). Если отказали все магазины — заказ ведём в `rejected`, не в `ready_to_take`.

### Переходы локального статуса (магазин)

```
pending       → approved | rejected
approved      → ready_to_take | rejected
ready_to_take → (терминальный)
rejected      → (терминальный)
```

Магазин может менять свою часть **только пока заказ глобально в `approved`** — иначе `400`.

---

## Все роуты

| Метод / путь | Право | Кто | Назначение |
|--------------|-------|-----|------------|
| `POST /orders/` | `orders:create` | Покупатель | Создать заказ из своей корзины (тело — см. ниже) |
| `GET /orders/` | `orders:read` | Админ | Все заказы. Query: `status_id`, `user_id`, `q` (номер заказа или часть телефона), `fbo_attention` (часть FBO ждёт склада), `sort`, `skip`, `limit` |
| `GET /orders/fbo/attention-count` | `orders:update_status` | Админ | Сколько заказов ждут сборки складом Postshop |
| `GET /orders/my` | `orders:read_own` | Покупатель | Свои заказы. Query: `status_id`, `sort`, `skip`, `limit` |
| `GET /orders/{order_id}` | `orders:read` | Админ | Один заказ целиком |
| `GET /orders/shop/{shop_id}` | `orders:read` | Магазин | Кабинет продавца: заказы магазина; `items`/`shops`/`order_shops` в ответе уже обрезаны только до этого магазина |
| `PATCH /orders/{order_id}/status` | `orders:update_status` | Админ | Сменить глобальный статус (см. ниже) |
| `PATCH /orders/{order_id}/shop/{shop_id}/status` | `orders:update_shop_status` | Магазин | Сменить локальный статус своей части (см. ниже) |
| `POST /orders/{order_id}/cancel` | `orders:create` | Покупатель | Отменить собственный заказ (см. ниже) |
| `GET /orders/shop/{shop_id}/top-products` | `orders:read` | Магазин | Топ товаров по `completed`-заказам (без rejected-частей). Query: `limit` (1–100, по умолчанию 10) |
| `GET /orders/shop/{shop_id}/weekly-revenue` | `orders:read` | Магазин | Выручка магазина за текущую неделю (с понедельника) по `completed`-заказам |
| `GET /order-statuses/` | публичный | Все | Справочник статусов с переводами названий — для отрисовки лейблов |
| `GET /order-statuses/{id}` | публичный | Все | Один статус справочника |
| `PUT /order-statuses/{id}/translations` | `order_statuses:update` | Админ | Обновить переводы названия статуса (тело — массив `{language, name}`, минимум один) |

`sort` принимает: `newest` (по умолчанию), `oldest`, `status_asc`, `status_desc`.

Доход магазина в аналитике считается **только по товарам** (`price_at_order × quantity`) — цена доставки в выручку магазинов не входит, это доход платформы.

---

## Создание заказа — `POST /orders/`

```jsonc
{
  "payment_type": "cash",        // cash | card | cash_and_card
  "delivery_address": "...",     // ЛИБО адрес…
  "pickup_point_id": 123,        // …ЛИБО пункт выдачи — одно из двух обязательно
  "comment": null                // опционально
}
```

Ошибки:

- `422` — не указан ни `delivery_address`, ни `pickup_point_id`;
- `400` — корзина пуста;
- `400` — в корзине есть неактивные / не прошедшие модерацию товары (в `detail` — список их id);
- `404` / `400` — пункт выдачи не найден / заблокирован;
- `400` — не хватает остатка (`Insufficient stock…`). FBS-позиции проверяются всегда, FBO — пока включён склад платформы (`FBO_ENABLED`).

Заказ всегда стартует с глобального `pending` и локального `pending` у каждого магазина. `delivery_price` на этом этапе ещё `null` — её назначит админ при одобрении.

---

## Смена глобального статуса — `PATCH /orders/{order_id}/status`

Тело: `{ "status_code": "<OrderStatusCode>", "comment": "опционально", "delivery_price": "только при approved" }`.

`delivery_price` (число ≥ 0) принимается **только** при переводе в `approved`:

- заказ с `delivery_address` — **обязательна** (без неё `400`);
- заказ с `pickup_point` (самовывоз) — не применима, передача вернёт `400`, в заказе остаётся `null`;
- на любом другом переходе передача `delivery_price` — `400`.

`comment` пишется в `status_comment` заказа (решение платформы), а не в `comment` покупателя.
При переводе в `rejected` магазинам с живой частью уходит `order_cancelled` с этим комментарием;
статусы частей не меняются.

Ответы: `200` — обновлённый `OrderResponse`; `400` — недопустимый переход / нарушен гард `ready_to_take` / ошибка `delivery_price`; `404` — заказ или целевой статус не найден.

## Смена локального статуса — `PATCH /orders/{order_id}/shop/{shop_id}/status`

Тело: `{ "status_code": "<LocalOrderStatusCode>", "comment": "опционально" }`.

**Доступно только когда глобальный статус заказа = `approved`.**

Ответы: `200` — обновлённый `OrderResponse`; `400` — заказ не в `approved` / недопустимый локальный переход; `404` — заказ не найден или у магазина нет части в этом заказе.

## Отмена покупателем — `POST /orders/{order_id}/cancel`

Тело: `{ "reason": "опционально" }`.

- Доступно **только владельцу** заказа (`403` для чужого) и только пока заказ глобально
  в `pending` или `approved` (`400` позже — заказ уже собирается).
- Переводит заказ в `rejected`; в `status_comment` пишется `Отменён покупателем` (+ причина,
  если передана) — по этому префиксу отмена покупателем отличается от отказа админа.
  `comment` (пожелание покупателя) не трогается.
- Статусы частей не меняются: отмена покупателем — не отказ магазина. Магазинам с живой
  частью уходит уведомление `order_cancelled` с причиной.
- Резерв стока освобождается автоматически, списания не было (оно происходит только на `completed`).

---

## Форма ответа `OrderResponse`

Один и тот же объект возвращают все GET/POST/PATCH-роуты заказа. Главное для фронта — массив `order_shops[]` и вычисляемые поля-итоги.

```jsonc
{
  "id": 1,
  "user_id": 10,
  "user": { /* UserDetailResponse */ },
  "order_status": {                         // ГЛОБАЛЬНЫЙ статус
    "id": 2,
    "code": "approved",
    "translations": [ { "language": "ru", "name": "Одобрен" } ],
    "is_active": true
  },
  "payment_type": "card",
  "delivery_address": "...",
  "delivery_price": 20.00,                  // null — не назначена (pending) или самовывоз
  "pickup_point": { /* PickupPointResponse | null */ },
  "comment": "...",                         // пожелание покупателя при оформлении
  "status_comment": "...",                  // решение платформы / «Отменён покупателем: …»

  "items": [                                // ВСЕ позиции заказа, плоским списком
    { "id": 1, "product_id": 7, "product": { /* ProductResponse */ },
      "quantity": 2, "price_at_order": 175.00 }
  ],

  "shops": [ /* ShopFullResponse[] */ ],    // уникальные магазины заказа (справочно)

  "order_shops": [                          // ← ЛОКАЛЬНЫЕ СТАТУСЫ работают здесь
    {
      "id": 3,
      "shop_base_id": 5,
      "shop": { /* ShopFullResponse */ },
      "status": "ready_to_take",            // ЛОКАЛЬНЫЙ статус магазина
      "comment": "соберём к 18:00",
      "items": [ /* OrderItemResponse[] — только позиции этого магазина */ ],
      "subtotal": 350.00                    // computed: сумма части магазина
    }
  ],

  // computed-поля (считает бэкенд, фронту пересчитывать не нужно):
  "total": 500.00,                // вся сумма товаров, включая отклонённые магазины (без доставки)
  "effective_total": 370.00,      // к оплате — без частей отклонённых магазинов, плюс delivery_price
  "has_rejected_shops": true,
  "all_shops_rejected": false,
  "all_active_shops_ready": true, // все неотклонённые в ready_to_take

  "created_at": "2026-06-28T12:00:00Z",
  "updated_at": null
}
```

### Как это отрисовывать

- **Общий статус заказа** для покупателя → `order_status.code` (+ `order_status.translations` для локализованного названия).
- **Прогресс по магазинам** (карточки «Магазин X: готовит / готов / отказался») → массив `order_shops[]`: `status`, `comment`, `subtotal`, вложенные `shop` и `items`.
- **Сумма к оплате** → `effective_total` (доставка уже внутри). Полную `total` показывайте зачёркнутой, если есть отказавшиеся магазины (`has_rejected_shops`).
- **Доставка** → отдельной строкой из `delivery_price`. `null` = самовывоз (есть `pickup_point`) либо цена ещё не назначена (заказ `pending` с `delivery_address`).
- **Кнопка админа «Собрать к доставке»** (`ready_to_take`) активна, когда `all_active_shops_ready === true`.
- **Названия статусов** на языке пользователя — из `order_status.translations` или справочника `GET /order-statuses/`. Коды (`pending`, …) не хардкодьте как подписи.
- **Кабинет магазина** (`GET /orders/shop/{shop_id}`) уже присылает только свою часть — фильтровать на фронте не нужно.

---

## Источники в коде

- Роуты: [`app/routers/orders.py`](../app/routers/orders.py), [`app/routers/order_statuses.py`](../app/routers/order_statuses.py)
- Схемы: [`app/schemas/order.py`](../app/schemas/order.py), [`app/schemas/order_status.py`](../app/schemas/order_status.py)
- Модели: [`app/models/order.py`](../app/models/order.py), [`app/models/order_shop.py`](../app/models/order_shop.py), [`app/models/order_status.py`](../app/models/order_status.py)
- Складская логика (резерв/списание): [`app/services/stock.py`](../app/services/stock.py)
- Справочник статусов сидится миграцией `a5122ee91c6e` и скриптом `scripts/seed_order_statuses.py`.
