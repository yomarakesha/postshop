"""
Общая обвязка тестов: сотрудник, посторонний и данные, на которых проверяем.

Тесты идут против запущенного приложения, а не через ASGI-клиент. Так дороже,
но честнее: находки аудита воспроизводились именно живыми запросами, и проверка
должна повторять тот же путь — с настоящей базой, настоящими правами и
настоящей выдачей SMS-кода.
"""

import os
import re
import subprocess
import time
from pathlib import Path

import httpx
import pytest

API_URL = os.environ.get("TEST_API_URL", "http://localhost:7002")
ADMIN_USER = os.environ.get("TEST_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")
LOG_PATH = Path(
    os.environ.get("TEST_LOG_PATH", Path.home() / ".postshop-local" / "logs" / "mvp.log")
)

# Номер для постороннего. Отдельный, чтобы не путать с данными, на которых
# кто-то мог работать руками.
OUTSIDER_PHONE = os.environ.get("TEST_OUTSIDER_PHONE", "+99362000099")

# Токен постороннего кладём рядом с журналом и переиспользуем: запрос кода
# ограничен минутой (429 «Please wait 1 minute»), поэтому два прогона подряд
# иначе пропускали бы весь набор.
TOKEN_CACHE = LOG_PATH.parent / ".test-outsider-token"


def _log_size() -> int:
    return LOG_PATH.stat().st_size if LOG_PATH.exists() else 0


def _fresh_otp_code(client: httpx.Client, phone: str) -> str:
    """
    Запрашивает новый код и ждёт, пока он появится в журнале.

    Код одноразовый, поэтому прошлый прогон свой уже израсходовал: брать
    последнюю строку журнала без нового запроса нельзя — вход упадёт с
    «Invalid or expired OTP», и весь набор тестов молча пропустится.

    В разработке код печатается в журнал вместо отправки SMS. Запрос кода
    ограничен по частоте, поэтому при отказе повторяем с паузой.
    """
    if not LOG_PATH.exists():
        pytest.skip(f"журнал {LOG_PATH} не найден — тесты читают код из него")

    for attempt in range(6):
        offset = _log_size()
        response = client.post("/auth/otp/request", json={"phone_number": phone})
        if response.status_code >= 400:
            time.sleep(5)
            continue

        # Ждём строку, появившуюся ПОСЛЕ нашего запроса: старые коды уже
        # использованы.
        deadline = time.time() + 10
        while time.time() < deadline:
            with LOG_PATH.open("r", errors="replace") as handle:
                handle.seek(offset)
                tail = handle.read()
            found = re.findall(rf"\[OTP\] phone={re.escape(phone)} code=(\d+)", tail)
            if found:
                return found[-1]
            time.sleep(0.5)
        time.sleep(2)

    pytest.skip(f"не удалось получить код для {phone}: запрос ограничен по частоте")


def _cached_token() -> str | None:
    if not TOKEN_CACHE.exists():
        return None
    value = TOKEN_CACHE.read_text().strip()
    return value or None


def _save_token(token: str) -> None:
    try:
        TOKEN_CACHE.parent.mkdir(parents=True, exist_ok=True)
        TOKEN_CACHE.write_text(token)
    except OSError:
        # Кэш — удобство, а не необходимость: без него тест просто запросит код.
        pass


def _token_works(client: httpx.Client, token: str) -> bool:
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    return response.status_code == 200


@pytest.fixture(scope="session")
def client() -> httpx.Client:
    with httpx.Client(base_url=API_URL, timeout=30) as session:
        try:
            session.get("/")
        except httpx.ConnectError:
            pytest.skip(f"приложение недоступно на {API_URL} — поднимите локальный стек")
        yield session


@pytest.fixture(scope="session")
def staff(client: httpx.Client) -> dict:
    """Сотрудник платформы: у него есть все права, включая админские."""
    response = client.post(
        "/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"вход сотрудника не удался: {response.status_code}")
    token = response.json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return {"headers": {"Authorization": f"Bearer {token}"}, "me": me}


@pytest.fixture(scope="session")
def outsider(client: httpx.Client) -> dict:
    """
    Посторонний: зарегистрирован по SMS, то есть с полным набором прав нового
    пользователя. Именно он в аудите добирался до чужих данных — права у него
    есть, а объекты не его.
    """
    token = _cached_token()
    if token and not _token_works(client, token):
        token = None

    if token is None:
        code = _fresh_otp_code(client, OUTSIDER_PHONE)
        response = client.post(
            "/auth/otp/verify", json={"phone_number": OUTSIDER_PHONE, "code": code}
        )
        if response.status_code != 200:
            pytest.skip(f"вход по SMS не удался: {response.status_code} {response.text[:120]}")
        token = response.json()["access_token"]
        _save_token(token)

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return {"headers": {"Authorization": f"Bearer {token}"}, "me": me}


@pytest.fixture(scope="session")
def foreign_shop_id(client: httpx.Client, staff: dict, outsider: dict) -> int:
    """Магазин, который постороннему не принадлежит."""
    shops = client.get("/shop-bases/?limit=100", headers=staff["headers"]).json()
    own = {shop["id"] for shop in (outsider["me"].get("shops") or [])}
    for shop in shops:
        if shop["id"] not in own:
            return shop["id"]
    pytest.skip("в базе нет чужого магазина")


@pytest.fixture(scope="session")
def foreign_product(client: httpx.Client, foreign_shop_id: int) -> dict:
    """Товар чужого магазина."""
    products = client.get("/products/?limit=200").json()
    for product in products:
        if product["shop_base_id"] == foreign_shop_id:
            return product
    pytest.skip(f"у магазина {foreign_shop_id} нет товаров в каталоге")


@pytest.fixture(scope="session")
def foreign_order(client: httpx.Client, staff: dict, outsider: dict) -> dict:
    """Заказ, оформленный не посторонним."""
    orders = client.get("/orders/?limit=50", headers=staff["headers"]).json()
    for order in orders:
        if order["user_id"] != outsider["me"]["id"]:
            return order
    pytest.skip("в базе нет чужого заказа")
