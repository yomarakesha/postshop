"""
Посторонний не может тронуть чужой объект.

Все находки раздела «Доступ» аудита 2026-08-17 были однотипными: право есть,
проверки владельца нет. Любой зарегистрировавшийся по SMS получал 26 прав и
вместе с ними доступ к чужим заказам, магазинам, складам и приходам — вплоть до
смены логина и пароля администратора.

Каждый тест здесь воспроизводит конкретную находку. Если проверка владения
когда-нибудь исчезнет из метода, соответствующий тест это покажет.
"""

import httpx
import pytest


# ── S-01: правка чужой записи пользователя ───────────────────────────────────

def test_outsider_cannot_edit_another_user(client: httpx.Client, outsider: dict, staff: dict):
    """Чужой профиль правит только сотрудник платформы."""
    response = client.put(
        f"/users/{staff['me']['id']}",
        headers=outsider["headers"],
        json={"surname": "Взломано"},
    )
    assert response.status_code == 403, response.text


def test_outsider_cannot_change_another_password(
    client: httpx.Client, outsider: dict, staff: dict
):
    """Смена пароля администратора посторонним — это захват аккаунта."""
    response = client.put(
        f"/users/{staff['me']['id']}",
        headers=outsider["headers"],
        json={"password": "Vzlomano12345"},
    )
    assert response.status_code == 403, response.text


def test_nobody_changes_another_login(client: httpx.Client, staff: dict, outsider: dict):
    """
    Логин чужому не меняет никто, даже сотрудник: подмена логина — это и есть
    захват аккаунта, законной причины переименовать чужой вход нет.
    """
    response = client.put(
        f"/users/{outsider['me']['id']}",
        headers=staff["headers"],
        json={"username": "podmena"},
    )
    assert response.status_code == 403, response.text


def test_user_can_edit_own_profile(client: httpx.Client, outsider: dict):
    """Своя запись правится свободно — иначе проверка была бы слишком строгой."""
    response = client.put(
        f"/users/{outsider['me']['id']}",
        headers=outsider["headers"],
        json={"surname": "Свой"},
    )
    assert response.status_code == 200, response.text


# ── S-03, S-04: заказы ───────────────────────────────────────────────────────

def test_order_list_shows_only_own(client: httpx.Client, outsider: dict):
    """Общий список заказов фильтруется по владельцу."""
    response = client.get("/orders/?limit=50", headers=outsider["headers"])
    assert response.status_code == 200, response.text
    for order in response.json():
        assert order["user_id"] == outsider["me"]["id"], "в списке чужой заказ"


def test_outsider_cannot_read_foreign_order(
    client: httpx.Client, outsider: dict, foreign_order: dict
):
    response = client.get(f"/orders/{foreign_order['id']}", headers=outsider["headers"])
    assert response.status_code == 403, response.text


def test_outsider_cannot_change_foreign_order_part(
    client: httpx.Client, outsider: dict, foreign_order: dict, foreign_shop_id: int
):
    """Отклонение части чужого заказа — саботаж чужой продажи."""
    response = client.patch(
        f"/orders/{foreign_order['id']}/shop/{foreign_shop_id}/status",
        headers=outsider["headers"],
        json={"status_code": "rejected"},
    )
    assert response.status_code == 403, response.text


def test_outsider_cannot_read_foreign_shop_orders(
    client: httpx.Client, outsider: dict, foreign_shop_id: int
):
    response = client.get(
        f"/orders/shop/{foreign_shop_id}?limit=10", headers=outsider["headers"]
    )
    assert response.status_code == 403, response.text


def test_outsider_cannot_read_foreign_shop_revenue(
    client: httpx.Client, outsider: dict, foreign_shop_id: int
):
    """Выручка конкурента — коммерческая тайна, а не публичные данные."""
    response = client.get(
        f"/orders/shop/{foreign_shop_id}/weekly-revenue", headers=outsider["headers"]
    )
    assert response.status_code == 403, response.text


# ── S-02, S-05, S-09: магазины и их документы ────────────────────────────────

def test_shop_registry_shows_only_own(client: httpx.Client, outsider: dict):
    response = client.get("/shop-bases/?limit=100", headers=outsider["headers"])
    assert response.status_code == 200, response.text
    for shop in response.json():
        assert shop["owner_id"] == outsider["me"]["id"], "в реестре чужой магазин"


@pytest.mark.parametrize(
    "method,path_suffix,payload",
    [
        ("patch", "/block", None),
        ("patch", "/unblock", None),
        ("put", "", {"documents": ["podmena.pdf"]}),
        ("patch", "/registration-status", {"registration_status": "suspended"}),
    ],
)
def test_outsider_cannot_manage_foreign_shop(
    client: httpx.Client, outsider: dict, foreign_shop_id: int, method, path_suffix, payload
):
    """Закрыть, открыть, переписать документы или приостановить чужой магазин."""
    response = client.request(
        method.upper(),
        f"/shop-bases/{foreign_shop_id}{path_suffix}",
        headers=outsider["headers"],
        json=payload,
    )
    assert response.status_code == 403, f"{method} {path_suffix}: {response.text}"


def test_outsider_cannot_read_foreign_shop_card(
    client: httpx.Client, outsider: dict, foreign_shop_id: int
):
    response = client.get(f"/shop-bases/{foreign_shop_id}", headers=outsider["headers"])
    assert response.status_code == 403, response.text


def test_outsider_cannot_read_pending_count(client: httpx.Client, outsider: dict):
    """Счётчик заявок — админская метрика."""
    response = client.get("/shop-bases/pending/count", headers=outsider["headers"])
    assert response.status_code == 403, response.text


def test_public_shop_list_hides_documents(client: httpx.Client):
    """
    Публичная выдача магазинов отдавала юридические документы всем без токена:
    паспорта и свидетельства скачивались по прямой ссылке.
    """
    response = client.get("/shop-bases/full?limit=50")
    assert response.status_code == 200, response.text
    for shop in response.json():
        assert not shop.get("documents"), f"магазин {shop['id']} отдаёт документы анонимно"


def test_documents_are_not_served_as_static(client: httpx.Client):
    """
    Каталог загрузок раздаётся статикой ради картинок товаров, и вместе с ними
    в сеть уходили документы. Прямой путь закрыт.
    """
    response = client.get("/uploads/documents/anything.pdf")
    assert response.status_code == 403, response.text


def test_outsider_cannot_download_foreign_document(
    client: httpx.Client, outsider: dict, staff: dict, foreign_shop_id: int
):
    shop = client.get(f"/shop-bases/{foreign_shop_id}", headers=staff["headers"]).json()
    documents = shop.get("documents") or []
    if not documents:
        pytest.skip(f"у магазина {foreign_shop_id} нет документов")
    filename = documents[0]["path"].split("/")[-1]
    response = client.get(
        f"/shop-bases/{foreign_shop_id}/documents/{filename}", headers=outsider["headers"]
    )
    assert response.status_code == 403, response.text


# ── S-06: профиль чужого магазина ────────────────────────────────────────────

def test_outsider_cannot_rename_foreign_shop(
    client: httpx.Client, outsider: dict, staff: dict, foreign_shop_id: int
):
    additionals = client.get(
        "/shop-additionals/?limit=100", headers=staff["headers"]
    ).json()
    target = next((a for a in additionals if a["shop_base_id"] == foreign_shop_id), None)
    if not target:
        pytest.skip(f"у магазина {foreign_shop_id} нет профиля")
    response = client.put(
        f"/shop-additionals/{target['id']}",
        headers=outsider["headers"],
        files=[("name", (None, "PWNED"))],
    )
    assert response.status_code == 403, response.text


def test_outsider_cannot_create_profile_for_foreign_shop(
    client: httpx.Client, outsider: dict, staff: dict
):
    additionals = client.get(
        "/shop-additionals/?limit=100", headers=staff["headers"]
    ).json()
    taken = {a["shop_base_id"] for a in additionals}
    own = {shop["id"] for shop in (outsider["me"].get("shops") or [])}
    shops = client.get("/shop-bases/?limit=100", headers=staff["headers"]).json()
    free = next((s["id"] for s in shops if s["id"] not in taken and s["id"] not in own), None)
    if free is None:
        pytest.skip("нет чужого магазина без профиля")
    # Тип склада обязателен, и его надо передать: иначе запрос отвергается на
    # проверке данных (422) и до проверки владения не доходит — тест проверял бы
    # не то, что нужно.
    response = client.post(
        "/shop-additionals/",
        headers=outsider["headers"],
        files=[
            ("shop_base_id", (None, str(free))),
            ("name", (None, "PWNED")),
            ("warehouse_type", (None, "fbo")),
        ],
    )
    assert response.status_code == 403, response.text


# ── S-07: склад чужого магазина ──────────────────────────────────────────────

def test_outsider_cannot_post_stock_to_foreign_shop(
    client: httpx.Client, outsider: dict, foreign_shop_id: int, foreign_product: dict
):
    response = client.post(
        "/stock-operations/",
        headers=outsider["headers"],
        json={
            "shop_id": foreign_shop_id,
            "product_id": foreign_product["id"],
            "measure_unit_id": foreign_product["measure_unit_id"],
            "operation_type": "income",
            "quantity": 999,
        },
    )
    assert response.status_code == 403, response.text


def test_stock_operation_rejects_product_of_another_shop(
    client: httpx.Client, outsider: dict, foreign_product: dict
):
    """
    Товар чужого магазина в операции означал бы, что он оприходуется на склад
    не своему владельцу.
    """
    own_shops = outsider["me"].get("shops") or []
    if not own_shops:
        pytest.skip("у постороннего нет своих магазинов")
    response = client.post(
        "/stock-operations/",
        headers=outsider["headers"],
        json={
            "shop_id": own_shops[0]["id"],
            "product_id": foreign_product["id"],
            "measure_unit_id": foreign_product["measure_unit_id"],
            "operation_type": "income",
            "quantity": 1,
        },
    )
    assert response.status_code == 400, response.text


@pytest.mark.parametrize("suffix", ["", "/balance"])
def test_outsider_cannot_read_foreign_stock(
    client: httpx.Client, outsider: dict, foreign_product: dict, suffix
):
    response = client.get(
        f"/stock-operations/{foreign_product['id']}{suffix}", headers=outsider["headers"]
    )
    assert response.status_code == 403, response.text


# ── S-08: приходы ────────────────────────────────────────────────────────────

def test_receipt_list_shows_only_own(client: httpx.Client, outsider: dict):
    response = client.get("/stock-receipts/?limit=50", headers=outsider["headers"])
    assert response.status_code == 200, response.text
    own = {shop["id"] for shop in (outsider["me"].get("shops") or [])}
    for receipt in response.json():
        assert receipt["shop_id"] in own, "в списке чужой приход"


def test_outsider_cannot_create_receipt_for_foreign_shop(
    client: httpx.Client, outsider: dict, foreign_shop_id: int, staff: dict
):
    warehouses = client.get("/warehouses/?limit=10", headers=staff["headers"]).json()
    if not warehouses:
        pytest.skip("в базе нет складов")
    response = client.post(
        "/stock-receipts/",
        headers=outsider["headers"],
        json={"shop_id": foreign_shop_id, "warehouse_id": warehouses[0]["id"]},
    )
    assert response.status_code == 403, response.text


def test_outsider_cannot_read_foreign_receipt(
    client: httpx.Client, outsider: dict, staff: dict
):
    receipts = client.get("/stock-receipts/?limit=10", headers=staff["headers"]).json()
    own = {shop["id"] for shop in (outsider["me"].get("shops") or [])}
    target = next((r for r in receipts if r["shop_id"] not in own), None)
    if not target:
        pytest.skip("в базе нет чужого прихода")
    response = client.get(
        f"/stock-receipts/{target['id']}", headers=outsider["headers"]
    )
    assert response.status_code == 403, response.text


# ── D-03: администратор не может лишить себя прав ────────────────────────────

def test_staff_cannot_revoke_own_permission_control(client: httpx.Client, staff: dict):
    """
    Снятое у себя право управления правами вернуть нечем: другого метода нет,
    удаления пользователя тоже. Оставалась только правка базы руками.
    """
    user_id = staff["me"]["id"]
    assert (
        client.delete(f"/permissions/{user_id}/permissions", headers=staff["headers"]).status_code
        == 400
    )
    assert (
        client.delete(
            f"/permissions/{user_id}/permissions/users:manage_permissions",
            headers=staff["headers"],
        ).status_code
        == 400
    )
    assert (
        client.put(
            f"/permissions/{user_id}/permissions",
            headers=staff["headers"],
            json={"permission_codes": ["products:read"]},
        ).status_code
        == 400
    )


# ── S-11: набор прав нового пользователя ─────────────────────────────────────

def test_new_user_has_no_staff_permissions(outsider: dict):
    """
    Права, по которым система отличает сотрудника платформы, при регистрации не
    выдаются — на них опирается вся проверка «свой или сотрудник».
    """
    codes = {perm["code"] for perm in outsider["me"].get("permissions", [])}
    for staff_only in (
        "users:read",
        "products:moderate",
        "orders:update_status",
        "stock_receipts:confirm",
        "users:manage_permissions",
        "reviews:moderate",
        "returns:manage",
    ):
        assert staff_only not in codes, f"новому пользователю выдано {staff_only}"


# ── N-07: пароль и номер меняются только с подтверждением ────────────────────

def test_own_password_not_changeable_through_profile(client: httpx.Client, outsider: dict):
    """
    Свой пароль через правку профиля не ставится.

    Метод открыт по токену и подтверждать там нечем: раньше один украденный
    токен превращался в постоянный захват аккаунта — владелец терял вход, и
    срок жизни токена уже ничего не решал.
    """
    response = client.put(
        f"/users/{outsider['me']['id']}",
        headers=outsider["headers"],
        json={"password": "HijackMe_123"},
    )
    assert response.status_code == 400, response.text
    assert "auth/password/change" in response.text


def test_own_phone_not_changeable_through_profile(client: httpx.Client, outsider: dict):
    """
    Свой номер через правку профиля не меняется: это логин для входа по SMS, и
    смена без подтверждения означала бы, что украденным токеном вход у владельца
    забирают навсегда.
    """
    response = client.put(
        f"/users/{outsider['me']['id']}",
        headers=outsider["headers"],
        json={"phone": "+99362000901"},
    )
    assert response.status_code == 400, response.text
    assert "auth/phone/change" in response.text


def test_nobody_changes_another_phone(client: httpx.Client, staff: dict, outsider: dict):
    """
    Номер чужому не меняет никто, включая сотрудника: номер — такой же вход, как
    логин, а логин чужому не меняют (см. test_nobody_changes_another_login).
    """
    response = client.put(
        f"/users/{outsider['me']['id']}",
        headers=staff["headers"],
        json={"phone": "+99362000902"},
    )
    assert response.status_code == 403, response.text


def test_password_change_requires_current_one(client: httpx.Client, staff: dict):
    """
    Отдельный метод смены пароля спрашивает текущий: без этого он повторял бы
    прежнюю дыру, только по другому адресу.
    """
    assert (
        client.post(
            "/auth/password/change",
            headers=staff["headers"],
            json={"new_password": "HijackMe_123"},
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/auth/password/change",
            headers=staff["headers"],
            json={"current_password": "WrongPass_1", "new_password": "HijackMe_123"},
        ).status_code
        == 403
    )


def test_password_and_phone_change_require_login(client: httpx.Client):
    """Оба метода — про свою учётную запись, без входа им не с чем работать."""
    for path, body in (
        ("/auth/password/change", {"current_password": "Any_12345", "new_password": "Other_12345"}),
        ("/auth/phone/change/request", {"new_phone": "+99362000903"}),
        ("/auth/phone/change/verify", {"new_phone": "+99362000903", "code": "000000"}),
    ):
        assert client.post(path, json=body).status_code in (401, 403), path


def test_phone_change_rejects_taken_and_own_number(
    client: httpx.Client, staff: dict, outsider: dict
):
    """
    Номер нельзя увести на чужой (два аккаунта с одним номером сделали бы вход
    по SMS неоднозначным) и незачем менять на свой же.
    """
    response = client.post(
        "/auth/phone/change/request",
        headers=outsider["headers"],
        json={"new_phone": outsider["me"]["phone"]},
    )
    assert response.status_code == 400, response.text

    staff_phone = staff["me"].get("phone")
    if staff_phone:
        response = client.post(
            "/auth/phone/change/request",
            headers=outsider["headers"],
            json={"new_phone": staff_phone},
        )
        assert response.status_code == 400, response.text


def test_phone_change_rejects_wrong_code(client: httpx.Client, outsider: dict):
    """
    Подтверждение проверяет код по-настоящему: без этого шаг был бы декорацией.

    Код здесь не запрашивается — запрос ограничен минутой и мешал бы остальным
    тестам; проверяется отказ, а успешный путь пройден вживую.
    """
    response = client.post(
        "/auth/phone/change/verify",
        headers=outsider["headers"],
        json={"new_phone": "+99362000904", "code": "000000"},
    )
    assert response.status_code == 401, response.text


# ── N-06: свои адреса доставки ───────────────────────────────────────────────

def test_address_list_shows_only_own(client: httpx.Client, staff: dict, outsider: dict):
    """
    Список адресов фильтруется по владельцу, а не по параметру запроса: адрес —
    это домашний адрес человека, и попасть в чужую выдачу он не должен ни при
    каком наборе прав.
    """
    created = client.post(
        "/user-addresses/",
        headers=staff["headers"],
        json={"title": "Тест", "address": "Проверка выдачи адресов"},
    )
    assert created.status_code == 201, created.text
    address_id = created.json()["id"]

    try:
        own_ids = {row["id"] for row in client.get("/user-addresses/", headers=outsider["headers"]).json()}
        assert address_id not in own_ids
    finally:
        client.delete(f"/user-addresses/{address_id}", headers=staff["headers"])


def test_outsider_cannot_touch_foreign_address(
    client: httpx.Client, staff: dict, outsider: dict
):
    """
    Чужой адрес не правится, не удаляется и не делается основным.

    Отказ — 404, а не 403: «такой адрес есть, но не твой» подтверждало бы
    существование чужой записи, и перебором по номерам можно было бы узнать,
    какие адреса заведены.
    """
    created = client.post(
        "/user-addresses/",
        headers=staff["headers"],
        json={"title": "Тест", "address": "Проверка доступа к чужому адресу"},
    )
    address_id = created.json()["id"]

    try:
        assert (
            client.put(
                f"/user-addresses/{address_id}",
                headers=outsider["headers"],
                json={"title": "Подмена"},
            ).status_code
            == 404
        )
        assert (
            client.patch(
                f"/user-addresses/{address_id}/default", headers=outsider["headers"]
            ).status_code
            == 404
        )
        assert (
            client.delete(
                f"/user-addresses/{address_id}", headers=outsider["headers"]
            ).status_code
            == 404
        )
        # Запись на месте — отказ был настоящим, а не «удалил и ответил 404».
        assert client.get(
            "/user-addresses/", headers=staff["headers"]
        ).json(), "адрес исчез после чужой попытки удаления"
    finally:
        client.delete(f"/user-addresses/{address_id}", headers=staff["headers"])


def test_address_requires_login(client: httpx.Client):
    """Адреса — личные, без входа их не читают и не создают."""
    assert client.get("/user-addresses/").status_code in (401, 403)
    assert (
        client.post("/user-addresses/", json={"title": "X", "address": "Y"}).status_code
        in (401, 403)
    )


def test_empty_address_is_rejected(client: httpx.Client, staff: dict):
    """
    Адрес из пробелов создавал бы запись, которую в списке не выбрать и не
    отличить от мусора.
    """
    assert (
        client.post(
            "/user-addresses/",
            headers=staff["headers"],
            json={"title": "Пусто", "address": "   "},
        ).status_code
        == 422
    )


def test_exactly_one_default_address(client: httpx.Client, staff: dict):
    """
    Основной адрес всегда ровно один: он подставляется при оформлении, и «два
    основных» означало бы, что подставляется какой попало.
    """
    ids = []
    try:
        for title in ("Первый", "Второй", "Третий"):
            response = client.post(
                "/user-addresses/",
                headers=staff["headers"],
                json={"title": title, "address": f"Адрес {title}"},
            )
            assert response.status_code == 201, response.text
            ids.append(response.json()["id"])

        client.patch(f"/user-addresses/{ids[1]}/default", headers=staff["headers"])
        rows = client.get("/user-addresses/", headers=staff["headers"]).json()
        assert sum(1 for row in rows if row["is_default"]) == 1

        # Удаление основного передаёт признак следующему: иначе при наличии
        # адресов не подставлялся бы ни один.
        client.delete(f"/user-addresses/{ids[1]}", headers=staff["headers"])
        rows = client.get("/user-addresses/", headers=staff["headers"]).json()
        assert sum(1 for row in rows if row["is_default"]) == 1
    finally:
        for address_id in ids:
            client.delete(f"/user-addresses/{address_id}", headers=staff["headers"])


# ── N-01: отзывы ─────────────────────────────────────────────────────────────

def test_review_requires_completed_purchase(
    client: httpx.Client, outsider: dict, foreign_product: dict
):
    """
    Отзыв только на купленный и полученный товар.

    Без этой привязки оценки ставил бы кто угодно кому угодно, и рейтинг ничего
    не значил бы: накрутить его стоило бы одного запроса.
    """
    response = client.post(
        "/reviews/",
        headers=outsider["headers"],
        json={"product_id": foreign_product["id"], "rating": 5, "text": "Не покупал"},
    )
    assert response.status_code == 403, response.text

    eligibility = client.get(
        f"/reviews/product/{foreign_product['id']}/eligibility", headers=outsider["headers"]
    ).json()
    assert eligibility["can_review"] is False
    # Причина нужна на экране: «нельзя» без объяснения читается как поломка.
    assert eligibility["reason"] == "not_purchased"


def test_outsider_cannot_moderate_reviews(client: httpx.Client, outsider: dict):
    """
    Проверка отзывов — работа платформы: reviews:moderate новым пользователям не
    выдаётся, иначе модерация витрины оказалась бы у всех подряд.
    """
    assert client.get("/reviews/moderation", headers=outsider["headers"]).status_code == 403
    assert (
        client.get("/reviews/moderation/count", headers=outsider["headers"]).status_code == 403
    )
    assert (
        client.patch("/reviews/1/approve", headers=outsider["headers"]).status_code == 403
    )
    assert (
        client.patch(
            "/reviews/1/reject",
            headers=outsider["headers"],
            json={"moderation_comment": "Причина"},
        ).status_code
        == 403
    )


def test_review_rating_must_be_one_to_five(
    client: httpx.Client, outsider: dict, foreign_product: dict
):
    """Оценка вне шкалы отсекается до базы, а не проверкой самой базы."""
    for rating in (0, 6, -1, 100):
        response = client.post(
            "/reviews/",
            headers=outsider["headers"],
            json={"product_id": foreign_product["id"], "rating": rating},
        )
        assert response.status_code == 422, f"оценка {rating}: {response.status_code}"


def test_public_reviews_hide_author_identity(client: httpx.Client, foreign_product: dict):
    """
    В публичной выдаче у автора только имя.

    Фамилия и телефон к оценке товара отношения не имеют, а отдавать их значит
    раскрывать, кто что купил, любому посетителю.
    """
    response = client.get(f"/reviews/product/{foreign_product['id']}")
    assert response.status_code == 200, response.text
    for review in response.json():
        assert set(review["author"].keys()) <= {"name"}
        assert "surname" not in review
        assert "phone" not in review


def test_own_reviews_require_login(client: httpx.Client):
    """Свои отзывы — личный список, без входа его не читают."""
    assert client.get("/reviews/my").status_code in (401, 403)


# ── N-02: возвраты ───────────────────────────────────────────────────────────

def test_return_requires_completed_purchase(client: httpx.Client, outsider: dict):
    """
    Возврат — только по своей покупке из завершённого заказа.

    Номер строки заказа перебираем: чужая покупка должна отвечать так же, как
    несуществующая, иначе перебором узнаётся, какие заказы есть.
    """
    for order_item_id in (1, 2, 999999):
        response = client.post(
            "/returns/",
            headers=outsider["headers"],
            json={"order_item_id": order_item_id, "quantity": 1, "reason": "Не подошло"},
        )
        assert response.status_code == 404, f"строка {order_item_id}: {response.status_code}"


def test_outsider_cannot_resolve_returns(client: httpx.Client, outsider: dict):
    """
    Решение по возврату принимает платформа: returns:manage новым пользователям
    не выдаётся, иначе покупатель подтверждал бы себе возвраты сам.
    """
    assert client.get("/returns/", headers=outsider["headers"]).status_code == 403
    assert client.get("/returns/count", headers=outsider["headers"]).status_code == 403
    assert (
        client.patch("/returns/1/approve", headers=outsider["headers"], json={}).status_code
        == 403
    )
    assert (
        client.patch(
            "/returns/1/reject",
            headers=outsider["headers"],
            json={"resolution_comment": "Причина"},
        ).status_code
        == 403
    )


def test_return_reject_requires_reason(client: httpx.Client, staff: dict):
    """
    Отказ без причины закрывает заявку молча — покупатель не понимает ни
    решения, ни что делать дальше. Проверка стоит до поиска заявки, поэтому
    несуществующий номер здесь подходит.
    """
    assert (
        client.patch("/returns/999999/reject", headers=staff["headers"], json={}).status_code
        == 422
    )


def test_return_quantity_must_be_positive(client: httpx.Client, outsider: dict):
    """Возврат нуля или отрицательного количества смысла не имеет."""
    for quantity in (0, -1):
        response = client.post(
            "/returns/",
            headers=outsider["headers"],
            json={"order_item_id": 1, "quantity": quantity, "reason": "Проверка"},
        )
        assert response.status_code == 422, f"количество {quantity}"


def test_returns_require_login(client: httpx.Client):
    """Свои заявки и подача — только для вошедших."""
    assert client.get("/returns/my").status_code in (401, 403)
    assert (
        client.post(
            "/returns/", json={"order_item_id": 1, "quantity": 1, "reason": "X"}
        ).status_code
        in (401, 403)
    )


# ── N-09: уведомления ────────────────────────────────────────────────────────

def test_notifications_are_private(client: httpx.Client, staff: dict, outsider: dict):
    """
    Уведомления адресные: в чужой выдаче их нет, и чужое не отмечается
    прочитанным.
    """
    assert client.get("/notifications/").status_code in (401, 403)
    assert client.get("/notifications/unread-count").status_code in (401, 403)

    own = client.get("/notifications/", headers=outsider["headers"])
    assert own.status_code == 200, own.text
    for notification in own.json():
        # Своя выдача — только свои: чужой id тут появиться не может, проверяем
        # само наличие поля-владельца отсутствием в ответе.
        assert "user_id" not in notification

    # Номер, которого у постороннего нет: отметить прочитанным нельзя.
    staff_ids = {row["id"] for row in client.get("/notifications/", headers=staff["headers"]).json()}
    own_ids = {row["id"] for row in own.json()}
    foreign = staff_ids - own_ids
    if foreign:
        target = next(iter(foreign))
        assert (
            client.patch(
                f"/notifications/{target}/read", headers=outsider["headers"]
            ).status_code
            == 404
        )
        assert (
            client.delete(
                f"/notifications/{target}", headers=outsider["headers"]
            ).status_code
            == 404
        )


def test_mark_all_read_clears_own_counter(client: httpx.Client, outsider: dict):
    """
    Отметка «прочитано всё» существует потому, что иначе список разбирается по
    одному, и признак нового не гаснет, пока не открыто каждое.
    """
    response = client.patch("/notifications/read-all", headers=outsider["headers"])
    assert response.status_code == 200, response.text
    assert response.json()["count"] == 0
    assert (
        client.get("/notifications/unread-count", headers=outsider["headers"]).json()["count"]
        == 0
    )
