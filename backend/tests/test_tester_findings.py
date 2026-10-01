"""
Находки тестировщика 2026-09-30 — каждая проверяется здесь, чтобы не вернуться.

Как и остальные тесты, работают против запущенного приложения и ничего не
меняют: проверяются отказы и то, что отдают публичные выдачи.
"""

import re

import httpx
import pytest

from app.services.barcode import ean13_check_digit, normalize_vendor_barcode, platform_barcode

UTC_SUFFIX = re.compile(r"(Z|\+00:00)$")


# ── Время: в ответах API помечено как UTC ───────────────────────────────────

def test_datetimes_are_marked_utc(client: httpx.Client):
    """Без зоны браузер читал время как местное — всё было на 5 часов раньше."""
    products = client.get("/products/", params={"limit": 5}).json()
    if not products:
        pytest.skip("в каталоге нет товаров")
    for product in products:
        assert UTC_SUFFIX.search(product["created_at"]), product["created_at"]


# ── Штрихкоды ───────────────────────────────────────────────────────────────

def test_platform_barcode_is_valid_ean13():
    code = platform_barcode(1)
    assert code == "2000000000015"
    assert code[-1] == ean13_check_digit(code[:12])


def test_every_product_has_platform_barcode(client: httpx.Client):
    products = client.get("/products/", params={"limit": 20}).json()
    if not products:
        pytest.skip("в каталоге нет товаров")
    for product in products:
        assert product["barcode"] == platform_barcode(product["id"])


@pytest.mark.parametrize("raw, expected", [
    (None, None), ("", None), ("   ", None),
    ("4600000000008", "4600000000008"), ("4600 0000 00008", "4600000000008"),
])
def test_vendor_barcode_normalization(raw, expected):
    assert normalize_vendor_barcode(raw) == expected


@pytest.mark.parametrize("raw", ["abc", "123", "12345678901", "123456789012345"])
def test_vendor_barcode_rejects_garbage(raw):
    with pytest.raises(Exception):
        normalize_vendor_barcode(raw)


# ── Пустой магазин не виден покупателю ──────────────────────────────────────

def test_guest_sees_only_filled_shops(client: httpx.Client):
    """Одобренный, но не заполненный магазин показывался пустой карточкой."""
    shops = client.get("/shop-bases/full", params={"limit": 100}).json()
    for shop in shops:
        additional = shop["additional"]
        assert additional and additional["name"] and additional["logo_path"], shop["id"]
        assert shop["is_active"] and shop["registration_status"] == "approved", shop["id"]


def test_staff_still_sees_every_shop(client: httpx.Client, staff: dict):
    guest = client.get("/shop-bases/full", params={"limit": 100}).json()
    full = client.get("/shop-bases/full", params={"limit": 100}, headers=staff["headers"]).json()
    assert len(full) >= len(guest)


# ── Склад ───────────────────────────────────────────────────────────────────

def _fbs_shop_with_stock(client: httpx.Client) -> tuple[int, dict]:
    additionals = client.get("/shop-additionals/", params={"limit": 100}).json()
    for additional in additionals:
        if additional["warehouse_type"] != "fbs":
            continue
        shop_id = additional["shop_base_id"]
        products = client.get(f"/products/?shop_base_ids={shop_id}&limit=50").json()
        ids = [p["id"] for p in products if p["shop_base_id"] == shop_id]
        if not ids:
            continue
        rows = client.get("/stock-operations/availability", params={"product_ids": ids}).json()
        for row in rows:
            if float(row["available"]) > 0:
                return shop_id, next(p for p in products if p["id"] == row["product_id"])
    pytest.skip("нет магазина FBS с остатком")


def test_sale_cannot_be_posted_by_hand(client: httpx.Client, staff: dict):
    """Продажу пишет заказ; записанная руками, она не соответствовала бы ничему."""
    shop_id, product = _fbs_shop_with_stock(client)
    response = client.post(
        "/stock-operations/",
        headers=staff["headers"],
        json={
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "sold",
            "quantity": 1,
        },
    )
    assert response.status_code == 400, response.text


def test_type_change_is_refused_while_shop_has_stock(client: httpx.Client, staff: dict):
    """Со сменой типа остаток «пропадал»: старый учёт переставал читаться."""
    shop_id, _ = _fbs_shop_with_stock(client)
    additional = client.get(f"/shop-additionals/by-shop/{shop_id}", headers=staff["headers"]).json()
    response = client.put(
        f"/shop-additionals/{additional['id']}",
        headers=staff["headers"],
        data={"warehouse_type": "fbo"},
    )
    assert response.status_code == 409, response.text


def test_platform_warehouse_refuses_fbs_shop(client: httpx.Client, staff: dict):
    shop_id, product = _fbs_shop_with_stock(client)
    warehouses = client.get("/warehouses/", params={"limit": 1}, headers=staff["headers"]).json()
    if not warehouses:
        pytest.skip("нет складов")
    response = client.post(
        "/warehouse-operations/",
        headers=staff["headers"],
        json={
            "warehouse_id": warehouses[0]["id"],
            "shop_id": shop_id,
            "product_id": product["id"],
            "measure_unit_id": product["measure_unit_id"],
            "operation_type": "income",
            "quantity": 1,
        },
    )
    assert response.status_code == 409, response.text


# ── Пункты выдачи ───────────────────────────────────────────────────────────

def test_pickup_points_can_be_limited_to_working_ones(client: httpx.Client):
    points = client.get("/pickup-points/", params={"is_active": True, "limit": 100}).json()
    assert all(point["is_active"] for point in points)


# ── Находки 01.10: заказы, возвраты ─────────────────────────────────────────

def test_operator_has_pending_orders_counter(client: httpx.Client, staff: dict):
    """Оператор узнавал о новом заказе, только открыв список."""
    response = client.get("/orders/pending/count", headers=staff["headers"])
    assert response.status_code == 200, response.text
    assert isinstance(response.json()["count"], int)


def test_pending_orders_counter_is_staff_only(client: httpx.Client, outsider: dict):
    response = client.get("/orders/pending/count", headers=outsider["headers"])
    assert response.status_code == 403, response.text


def test_orders_say_how_they_are_received(client: httpx.Client, staff: dict):
    """По способу получения подписывается шаг: «в пункте выдачи» или «в доставке»."""
    orders = client.get("/orders/", params={"limit": 20}, headers=staff["headers"]).json()
    if not orders:
        pytest.skip("заказов нет")
    for order in orders:
        expected = "delivery" if order["delivery_address"] else "pickup"
        assert order["delivery_method"] == expected


def test_return_cannot_be_received_before_approval(client: httpx.Client, staff: dict):
    returns = client.get(
        "/returns/", params={"return_status": "pending", "limit": 1}, headers=staff["headers"]
    ).json()
    if not returns:
        pytest.skip("нет заявок на рассмотрении")
    response = client.patch(
        f"/returns/{returns[0]['id']}/receive", headers=staff["headers"], json={"restock": True}
    )
    assert response.status_code == 400, response.text


def test_receiving_unknown_return_is_404(client: httpx.Client, staff: dict):
    response = client.patch(
        "/returns/99999999/receive", headers=staff["headers"], json={"restock": False}
    )
    assert response.status_code == 404, response.text
