"""
FBS и FBO — два разных способа работы магазина, и они не смешиваются.

* FBS: товар у магазина, остаток магазин ведёт сам (движения по складу).
  Работает всегда.
* FBO: товар на складе платформы. Магазин отправляет документ приёмки,
  сотрудник его подтверждает, остаток и списания ведёт платформа. Работает,
  пока включён склад платформы (FBO_ENABLED).

До разделения приёмку мог завести магазин FBS, движения по складу — магазин
FBO, а тип склада продавец переключал сам. Остаток, заведённый в одном учёте,
не влиял на заказы из другого.

Здесь же — документы, которые магазин отправляет на проверку при создании.
"""

import httpx
import pytest


def _features(client: httpx.Client) -> dict:
    return client.get("/features/").json()


def _shop_of_type(client: httpx.Client, warehouse_type: str) -> int:
    """Одобренный магазин нужного типа. Сотруднику доступен любой магазин."""
    additionals = client.get(
        "/shop-additionals/", params={"limit": 100, "registration_status": "approved"}
    ).json()
    for additional in additionals:
        if additional["warehouse_type"] == warehouse_type:
            return additional["shop_base_id"]
    pytest.skip(f"в базе нет одобренного магазина {warehouse_type}")


def _product_of(client: httpx.Client, shop_id: int) -> dict:
    products = client.get(f"/products/?shop_base_ids={shop_id}&limit=50").json()
    own = [product for product in products if product["shop_base_id"] == shop_id]
    if not own:
        pytest.skip(f"у магазина {shop_id} нет товаров")
    return own[0]


# ── Флаг ─────────────────────────────────────────────────────────────────────

def test_features_expose_fbo_flag_only(client: httpx.Client):
    """Выключается только склад платформы; FBS отдельного флага не имеет."""
    features = _features(client)
    assert "fbo_enabled" in features
    assert "fbs_enabled" not in features


def test_fbs_stock_is_open_regardless_of_flag(client: httpx.Client, foreign_product: dict):
    """Доступность остатка отвечает всегда: FBS не выключается."""
    response = client.get(
        "/stock-operations/availability", params={"product_ids": [foreign_product["id"]]}
    )
    assert response.status_code == 200, response.text


# ── Каждому типу — свой учёт ─────────────────────────────────────────────────

def test_stock_operations_reject_fbo_shop(client: httpx.Client, staff: dict):
    shop_id = _shop_of_type(client, "fbo")
    product = _product_of(client, shop_id)
    response = client.post(
        "/stock-operations/",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "income",
            "quantity": 1,
        },
    )
    assert response.status_code == 409, response.text


def test_stock_receipts_reject_fbs_shop(client: httpx.Client, staff: dict):
    if not _features(client)["fbo_enabled"]:
        pytest.skip("склад платформы выключен")
    shop_id = _shop_of_type(client, "fbs")
    warehouses = client.get("/warehouses/?limit=5", headers=staff["headers"]).json()
    if not warehouses:
        pytest.skip("нет складов платформы")
    response = client.post(
        "/stock-receipts/",
        headers=staff["headers"],
        json={"shop_id": shop_id, "warehouse_id": warehouses[0]["id"]},
    )
    assert response.status_code == 409, response.text


def test_confirmed_receipt_makes_fbo_product_available(client: httpx.Client, staff: dict):
    """Путь FBO целиком: приёмка → подтверждение → товар доступен к покупке."""
    if not _features(client)["fbo_enabled"]:
        pytest.skip("склад платформы выключен")
    shop_id = _shop_of_type(client, "fbo")
    product = _product_of(client, shop_id)
    warehouses = client.get("/warehouses/?limit=5&is_active=true", headers=staff["headers"]).json()
    if not warehouses:
        pytest.skip("нет активных складов платформы")

    def availability() -> dict:
        rows = client.get(
            "/stock-operations/availability", params={"product_ids": [product["id"]]}
        ).json()
        return rows[0]

    before = availability()
    assert before["tracked"] is True, "товар FBO при включённом складе должен учитываться"

    receipt = client.post(
        "/stock-receipts/",
        headers=staff["headers"],
        json={"shop_id": shop_id, "warehouse_id": warehouses[0]["id"]},
    )
    assert receipt.status_code == 201, receipt.text
    receipt_id = receipt.json()["id"]
    item = client.post(
        f"/stock-receipts/{receipt_id}/items",
        headers=staff["headers"],
        json={
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "quantity": 3,
        },
    )
    assert item.status_code == 201, item.text
    confirmed = client.post(f"/stock-receipts/{receipt_id}/confirm", headers=staff["headers"])
    assert confirmed.status_code == 200, confirmed.text

    after = availability()
    assert float(after["available"]) == float(before["available"]) + 3


def test_cart_refuses_more_than_in_stock(client: httpx.Client, staff: dict):
    """Товар без остатка не кладётся в корзину, а не отказывает на оформлении."""
    rows = client.get(
        "/stock-operations/availability",
        params=[("product_ids", product_id) for product_id in range(1, 40)],
    ).json()
    empty = next(
        (row for row in rows if row["tracked"] and float(row["available"]) <= 0), None
    )
    if empty is None:
        pytest.skip("в базе нет товара с нулевым остатком")

    response = client.post(
        "/cart/",
        headers=staff["headers"],
        json={"product_id": empty["product_id"], "quantity": 1},
    )
    assert response.status_code == 400, response.text
    assert "Insufficient stock" in response.text


def test_owner_is_notified_when_product_runs_out(client: httpx.Client, staff: dict):
    """Остаток дошёл до нуля — продавцу заводится уведомление, и только одно."""
    shop_id = _shop_of_type(client, "fbs")
    product = _product_of(client, shop_id)
    left = float(
        client.get(
            "/stock-operations/availability", params={"product_ids": [product["id"]]}
        ).json()[0]["available"]
    )
    if left <= 0:
        pytest.skip("товар уже закончился — проверять переход через ноль не на чем")

    write_off = client.post(
        "/stock-operations/",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "return_to_supplier",
            "quantity": left,
        },
    )
    assert write_off.status_code == 201, write_off.text

    rows = client.get(
        "/stock-operations/availability", params={"product_ids": [product["id"]]}
    ).json()
    assert float(rows[0]["available"]) <= 0

    # Вернём товар на место, чтобы прогон не оставлял магазин пустым.
    client.post(
        "/stock-operations/",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "income",
            "quantity": left,
        },
    )



def _available(client: httpx.Client, product_id: int) -> float:
    rows = client.get(
        "/stock-operations/availability", params={"product_ids": [product_id]}
    ).json()
    return float(rows[0]["available"])


def test_set_stock_writes_the_difference(client: httpx.Client, staff: dict):
    """Пересчёт: продавец называет итог, в журнал ложится разница со знаком."""
    shop_id = _shop_of_type(client, "fbs")
    product = _product_of(client, shop_id)
    before = _available(client, product["id"])
    target = before + 5

    body = {
        "shop_id": shop_id,
        "product_id": product["id"],
        "measure_unit_id": product["measure_unit_id"],
    }
    response = client.post(
        "/stock-operations/set", headers=staff["headers"], json={**body, "quantity": target}
    )
    assert response.status_code == 201, response.text
    assert response.json()["operation_type"] == "correction"
    assert float(response.json()["quantity"]) == 5
    assert _available(client, product["id"]) == target

    # Обратно вниз — та же операция с минусом, а не выдуманный «возврат».
    down = client.post(
        "/stock-operations/set", headers=staff["headers"], json={**body, "quantity": before}
    )
    assert down.status_code == 201, down.text
    assert float(down.json()["quantity"]) == -5
    assert _available(client, product["id"]) == before


def test_set_stock_refuses_a_pointless_write(client: httpx.Client, staff: dict):
    """Остаток и так такой: пустая запись «изменение 0» журнал только засоряет."""
    shop_id = _shop_of_type(client, "fbs")
    product = _product_of(client, shop_id)
    response = client.post(
        "/stock-operations/set",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "quantity": _available(client, product["id"]),
        },
    )
    assert response.status_code == 409, response.text


def test_correction_cannot_be_posted_by_hand(client: httpx.Client, staff: dict):
    """Пересчёт пишется только своим методом: иначе разницу считал бы экран."""
    shop_id = _shop_of_type(client, "fbs")
    product = _product_of(client, shop_id)
    response = client.post(
        "/stock-operations/",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "correction",
            "quantity": 3,
        },
    )
    assert response.status_code == 400, response.text

# ── Тип склада ───────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def outsider_shop(client: httpx.Client, outsider: dict) -> dict:
    """Магазин постороннего на рассмотрении, с профилем FBS."""
    shops = client.get("/shop-bases/?limit=100", headers=outsider["headers"]).json()
    for shop in shops:
        if shop["registration_status"] != "pending":
            continue
        additional = client.get(f"/shop-additionals/by-shop/{shop['id']}")
        if additional.status_code == 200 and additional.json()["warehouse_type"] == "fbs":
            shop["additional"] = additional.json()
            return shop
    created = client.post(
        "/shop-bases/",
        headers=outsider["headers"],
        json={"legal_entity_type": "individual_entrepreneur", "documents": []},
    )
    assert created.status_code == 201, created.text
    shop = created.json()
    additional = client.post(
        "/shop-additionals/",
        headers=outsider["headers"],
        files=[
            ("shop_base_id", (None, str(shop["id"]))),
            ("warehouse_type", (None, "fbs")),
        ],
    )
    assert additional.status_code == 201, additional.text
    shop["additional"] = additional.json()
    return shop


def test_owner_cannot_switch_warehouse_type(
    client: httpx.Client, outsider: dict, outsider_shop: dict
):
    """Тип выбирается при активации; менять его — дело сотрудника."""
    response = client.put(
        f"/shop-additionals/{outsider_shop['additional']['id']}",
        headers=outsider["headers"],
        files=[("warehouse_type", (None, "fbo"))],
    )
    assert response.status_code == 403, response.text


def test_staff_can_switch_warehouse_type(
    client: httpx.Client, staff: dict, outsider_shop: dict
):
    additional_id = outsider_shop["additional"]["id"]
    target = "fbo" if _features(client)["fbo_enabled"] else "fbs"
    response = client.put(
        f"/shop-additionals/{additional_id}",
        headers=staff["headers"],
        files=[("warehouse_type", (None, target))],
    )
    assert response.status_code == 200, response.text
    # Возвращаем как было, чтобы следующий прогон видел тот же магазин FBS.
    restored = client.put(
        f"/shop-additionals/{additional_id}",
        headers=staff["headers"],
        files=[("warehouse_type", (None, "fbs"))],
    )
    assert restored.status_code == 200, restored.text


# ── Документы магазина ───────────────────────────────────────────────────────

REAL_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def test_document_must_match_its_format(
    client: httpx.Client, outsider: dict, outsider_shop: dict
):
    """Исполняемый файл под именем passport.pdf не принимается."""
    response = client.post(
        f"/shop-bases/{outsider_shop['id']}/documents",
        headers=outsider["headers"],
        files=[
            ("files", ("passport.pdf", b"MZ\x90\x00fake-executable", "application/pdf")),
            ("kinds", (None, "individual_passport")),
        ],
    )
    assert response.status_code == 400, response.text


@pytest.mark.parametrize("name", ["contract.doc", "contract.docx", "script.html", "photo.svg"])
def test_document_rejects_unlisted_formats(
    client: httpx.Client, outsider: dict, outsider_shop: dict, name: str
):
    response = client.post(
        f"/shop-bases/{outsider_shop['id']}/documents",
        headers=outsider["headers"],
        files=[
            ("files", (name, b"whatever", "application/octet-stream")),
            ("kinds", (None, "individual_passport")),
        ],
    )
    assert response.status_code == 400, response.text


def _upload(client, who, shop_id, *parts):
    files = []
    for name, content, kind in parts:
        files.append(("files", (name, content, "application/pdf")))
        files.append(("kinds", (None, kind)))
    return client.post(f"/shop-bases/{shop_id}/documents", headers=who["headers"], files=files)


def test_real_pdf_is_accepted_with_its_kind(
    client: httpx.Client, outsider: dict, outsider_shop: dict
):
    """Документ сохраняется с видом: модератор видит, что это паспорт."""
    response = _upload(
        client, outsider, outsider_shop["id"], ("scan 1.pdf", REAL_PDF, "individual_passport")
    )
    assert response.status_code == 200, response.text
    passports = [doc for doc in response.json()["documents"] if doc["kind"] == "individual_passport"]
    assert len(passports) == 1
    assert passports[0]["original_name"] == "scan 1.pdf"
    assert passports[0]["scan"] in {"clean", "not_scanned"}


def test_same_kind_replaces_previous_document(
    client: httpx.Client, outsider: dict, outsider_shop: dict
):
    """Досланный паспорт заменяет прежний, а не ложится вторым."""
    first = _upload(client, outsider, outsider_shop["id"], ("a.pdf", REAL_PDF, "individual_passport"))
    assert first.status_code == 200, first.text
    second = _upload(client, outsider, outsider_shop["id"], ("b.pdf", REAL_PDF, "individual_passport"))
    assert second.status_code == 200, second.text
    passports = [doc for doc in second.json()["documents"] if doc["kind"] == "individual_passport"]
    assert [doc["original_name"] for doc in passports] == ["b.pdf"]


def test_infected_document_is_rejected(client: httpx.Client, outsider: dict, outsider_shop: dict):
    """Заражённый файл не принимается — проверено стандартной строкой EICAR.

    Пропускается, когда антивирус выключен: тогда сервер проверяет только
    формат и отвечает про него (см. tests/test_antivirus.py).
    """
    eicar = rb"X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
    response = _upload(client, outsider, outsider_shop["id"], ("passport.pdf", eicar, "individual_passport"))
    if "antivirus" not in response.text:
        pytest.skip("антивирус выключен — файл отклонён проверкой формата")
    assert response.status_code == 400, response.text


def test_document_kind_is_required_and_must_match_entity(
    client: httpx.Client, outsider: dict, outsider_shop: dict
):
    """Без вида файл не принимается; устав юрлица у ИП — тоже."""
    no_kind = client.post(
        f"/shop-bases/{outsider_shop['id']}/documents",
        headers=outsider["headers"],
        files=[("files", ("a.pdf", REAL_PDF, "application/pdf"))],
    )
    assert no_kind.status_code == 422, no_kind.text
    wrong = _upload(client, outsider, outsider_shop["id"], ("a.pdf", REAL_PDF, "legal_charter"))
    assert wrong.status_code == 422, wrong.text


FOREIGN_PATH = "uploads/documents/1_00000000000000000000000000000000.pdf"


@pytest.fixture(scope="module")
def bare_outsider_shop(client: httpx.Client, outsider: dict) -> dict:
    """Заявка постороннего без документов и профиля; создаётся один раз."""
    shops = client.get("/shop-bases/?limit=100", headers=outsider["headers"]).json()
    for shop in shops:
        if shop["registration_status"] != "pending" or shop["documents"]:
            continue
        if client.get(f"/shop-additionals/by-shop/{shop['id']}").status_code == 404:
            return shop
    # Путь чужого файла в теле создания должен быть проигнорирован.
    created = client.post(
        "/shop-bases/",
        headers=outsider["headers"],
        json={"legal_entity_type": "individual_entrepreneur", "documents": [FOREIGN_PATH]},
    )
    assert created.status_code == 201, created.text
    assert created.json()["documents"] == [], "путь чужого документа принят при создании"
    return created.json()


def test_documents_cannot_be_assigned_by_path(
    client: httpx.Client, outsider: dict, bare_outsider_shop: dict
):
    """Чужой файл нельзя «присвоить», вписав его путь в список."""
    response = client.put(
        f"/shop-bases/{bare_outsider_shop['id']}",
        headers=outsider["headers"],
        json={"documents": [FOREIGN_PATH]},
    )
    assert response.status_code == 400, response.text


def test_shop_without_documents_cannot_be_approved(
    client: httpx.Client, staff: dict, bare_outsider_shop: dict
):
    response = client.patch(
        f"/shop-bases/{bare_outsider_shop['id']}/registration-status",
        headers=staff["headers"],
        json={"registration_status": "approved"},
    )
    assert response.status_code == 400, response.text
