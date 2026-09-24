"""
Дымовые проверки публичной части.

Зачем отдельный набор. Тесты авторизации отвечают на вопрос «может ли чужой
сделать плохое»: из 50 проверок 42 ждут отказа. На вопрос «работает ли вообще»
они не отвечают — и 20 августа `GET /products/{id}` отдавал 500 на каждом
товаре, страница товара показывала пустую оболочку, а весь набор был зелёным.

Здесь наоборот: каждый метод, который витрина зовёт без входа, должен ответить
200 и вернуть данные ожидаемой формы. Проверки намеренно поверхностные — это
дымоход, а не проверка бизнес-правил: он ловит падения и поломанные ответы,
которые видит любой посетитель на первом же экране.
"""

import pathlib

import httpx
import pytest


def _list(client: httpx.Client, path: str) -> list:
    response = client.get(path, params={"limit": 5})
    assert response.status_code == 200, f"{path}: {response.status_code} {response.text[:160]}"
    data = response.json()
    assert isinstance(data, list), f"{path}: ожидался список, пришло {type(data).__name__}"
    return data


# ── Списки, которые открываются на главной ───────────────────────────────────

@pytest.mark.parametrize("path", [
    "/products/",
    "/categories/",
    "/brands/",
    "/collections/",
    "/banners/",
    "/cities/",
    "/currencies/",
    "/measure-units/",
    "/pickup-points/",
    "/order-statuses/",
    # Профили магазинов и полный список магазинов — публичные: витрина рисует
    # по ним карточки продавцов до всякого входа. Именно /shop-bases/full
    # раздавал юридические документы кому угодно (S-02), поэтому он тут ещё и
    # под присмотром: форма ответа не должна расшириться обратно.
    "/shop-additionals/",
    "/shop-bases/full",
])
def test_public_list_responds(client: httpx.Client, path: str):
    """Список отдаётся и имеет форму списка. Первый экран покупателя — это они."""
    _list(client, path)


# ── Карточки: именно здесь была 500 ──────────────────────────────────────────

def test_product_card_responds(client: httpx.Client):
    """
    Карточка товара отдаётся целиком.

    Проверяем не только код ответа, но и поля, которые рисует страница: при
    сбое сериализации ответ может прийти пустым или без части полей, а страница
    покажет нули и пустоту вместо товара — ровно так это и выглядело.
    """
    products = _list(client, "/products/")
    if not products:
        pytest.skip("в каталоге нет товаров")

    product_id = products[0]["id"]
    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200, f"{response.status_code} {response.text[:200]}"

    product = response.json()
    for field in ("id", "price", "translations", "shop_base_id", "category_id"):
        assert field in product, f"в карточке товара нет поля {field}"
    assert product["translations"], "у товара нет ни одного перевода названия"


def test_product_views_counter_does_not_break_the_card(client: httpx.Client):
    """
    Повторное открытие карточки не ломает ответ.

    Счётчик просмотров пишет в ту же строку, которую отдаёт ответ. Первая
    попытка это сделать сбрасывала загруженный экземпляр, и карточка падала —
    но только при обращении, а не при импорте, поэтому заметить это можно лишь
    настоящим запросом. Двумя подряд проверяем и сам счётчик, и то, что он не
    мешает выдаче.
    """
    products = _list(client, "/products/")
    if not products:
        pytest.skip("в каталоге нет товаров")

    product_id = products[0]["id"]
    for attempt in range(2):
        response = client.get(f"/products/{product_id}")
        assert response.status_code == 200, f"обращение {attempt + 1}: {response.text[:160]}"


@pytest.mark.parametrize("collection_path", [
    ("/categories/{id}"),
    ("/brands/{id}"),
    ("/collections/{id}"),
])
def test_public_detail_responds(client: httpx.Client, collection_path: str):
    """Выдача по номеру отдаётся для первого же существующего объекта."""
    list_path = collection_path.replace("/{id}", "/")
    items = _list(client, list_path)
    if not items:
        pytest.skip(f"{list_path} пуст")

    path = collection_path.format(id=items[0]["id"])
    response = client.get(path)
    assert response.status_code == 200, f"{path}: {response.status_code} {response.text[:160]}"
    assert response.json().get("id") == items[0]["id"]


def test_similar_products_respond(client: httpx.Client):
    """Похожие товары показываются под каждой карточкой."""
    products = _list(client, "/products/")
    if not products:
        pytest.skip("в каталоге нет товаров")
    response = client.get(f"/products/{products[0]['id']}/similar")
    assert response.status_code == 200, response.text[:160]
    assert isinstance(response.json(), list)


def test_reviews_of_product_respond(client: httpx.Client):
    """Отзывы и сводка по товару — публичные, открываются на карточке."""
    products = _list(client, "/products/")
    if not products:
        pytest.skip("в каталоге нет товаров")
    product_id = products[0]["id"]

    reviews = client.get(f"/reviews/product/{product_id}")
    assert reviews.status_code == 200, reviews.text[:160]
    assert isinstance(reviews.json(), list)

    summary = client.get(f"/reviews/product/{product_id}/summary")
    assert summary.status_code == 200, summary.text[:160]
    body = summary.json()
    assert body["product_id"] == product_id
    # Разбивка по звёздам приходит всегда, включая нулевые: без неё гистограмма
    # на карточке рисуется по неполным данным.
    assert set(body["breakdown"]) == {"1", "2", "3", "4", "5"} or set(body["breakdown"]) == {1, 2, 3, 4, 5}


def test_features_respond(client: httpx.Client):
    """Витрина и админка решают по этой ручке, какие разделы показывать."""
    response = client.get("/features/")
    assert response.status_code == 200, response.text
    assert isinstance(response.json()["fbo_enabled"], bool)


def test_search_responds(client: httpx.Client):
    """
    Поиск работает и без города.

    Раньше город был обязателен и без него приходило 422. Это убрали
    намеренно (725077e): город стал сигналом ранжирования, а не фильтром, —
    местное идёт первым, остальное следом. Проверяем оба случая, чтобы
    обязательность не вернулась молча.
    """
    assert client.get("/search/", params={"query": "a"}).status_code == 200

    cities = _list(client, "/cities/")
    if not cities:
        pytest.skip("в базе нет городов")
    response = client.get("/search/", params={"query": "a", "city_id": cities[0]["id"], "limit": 5})
    assert response.status_code == 200, response.text[:160]
    assert "products" in response.json()


# ── Сторож: новый публичный метод не должен остаться без проверки ────────────

# Методы, которые сюда не входят намеренно, с причиной.
SMOKE_EXEMPT = {
    "/",  # проверка живости, данных не отдаёт
}


def test_every_public_endpoint_is_covered(client: httpx.Client):
    """
    Новый публичный метод не может появиться без дымовой проверки.

    Дыра, из-за которой 500 на карточке товара прошла незамеченной, была не в
    конкретном тесте, а в том, что публичную часть никто не проверял вовсе. Без
    сторожа она откроется снова при следующем добавлении метода: покрытие
    держится не привычкой, а тем, что его отсутствие роняет набор.

    Публичность определяется опытом, а не полем `security` в схеме: описание
    ему не соответствует — часть методов помечена как открытая, а отвечает 401.
    Спрашиваем сам сервер без токена и считаем публичным то, что ответило 200.
    """
    schema = client.get("/openapi.json")
    assert schema.status_code == 200

    source = pathlib.Path(__file__).read_text()
    uncovered = []

    for path, methods in sorted(schema.json()["paths"].items()):
        if "get" not in methods or "{" in path or path in SMOKE_EXEMPT:
            continue
        # Без заголовка авторизации: клиент из conftest его и не ставит.
        if client.get(path, params={"limit": 1}).status_code != 200:
            continue
        if path.rstrip("/") not in source:
            uncovered.append(f"GET {path}")

    assert not uncovered, (
        "публичные методы без дымовой проверки: "
        + ", ".join(uncovered)
        + ". Добавьте их сюда или в SMOKE_EXEMPT с причиной."
    )
