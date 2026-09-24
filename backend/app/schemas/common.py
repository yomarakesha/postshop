"""Общие ограничения для входных схем.

Раньше в схемах `Create`/`Update` не было ни одной верхней границы: единственной
защитой были ограничения самой БД, и срабатывали они как HTTP 500 с сырой
SQL-ошибкой (`DataError (1406): Data too long for column 'name'`). Название
бренда в 50 000 символов доходило до базы, координаты 9999 тоже.

Здесь собраны типы с границами. Длины совпадают с колонками моделей, чтобы
проверка отсекала значение до базы и отвечала понятной 422, а не 500. Для
колонок `TEXT` (адреса, комментарии, описания) выбраны разумные прикладные
пределы — база их вместила бы, но безразмерное поле всё равно вредно.

Нижняя граница у названий (`min_length=1` с обрезкой пробелов) была добавлена
раньше: значение из одних пробелов принималось со статусом 201 и создавало
невидимую запись, которую нельзя ни найти, ни убрать.
"""

from decimal import Decimal
from typing import Annotated

from pydantic import Field, StringConstraints


def limited_str(max_length: int, *, min_length: int = 1, strip: bool = True):
    """Строка с обрезкой пробелов и обеими границами длины."""
    return Annotated[
        str,
        StringConstraints(
            strip_whitespace=strip, min_length=min_length, max_length=max_length
        ),
    ]


def optional_text(max_length: int):
    """Необязательный текст: пустая строка допустима, длина ограничена."""
    return Annotated[str, StringConstraints(strip_whitespace=True, max_length=max_length)]


# ── Названия и коды (длины совпадают с колонками) ──
Name100 = limited_str(100)
Name255 = limited_str(255)
Code20 = limited_str(20)
Code100 = limited_str(100)
LangCode = limited_str(10)
IsoCode3 = limited_str(3)

# ── Пользователь ──
Username50 = limited_str(50)
Email100 = limited_str(100)
Phone20 = limited_str(20)
Phone50 = limited_str(50)
# Пароль не обрезаем: пробелы в нём значимы.
Password255 = Annotated[str, StringConstraints(min_length=8, max_length=255)]

# ── Свободный текст (в БД это TEXT, предел выбран прикладной) ──
Address500 = optional_text(500)
# Сохранённый адрес пустым быть не может: в заказе адрес необязателен (есть
# самовывоз), а вот пустая запись в списке своих адресов невыбираема и
# неотличима от мусора — ровно тот случай, о котором сказано выше.
AddressRequired500 = limited_str(500)
Comment1000 = optional_text(1000)
Description2000 = optional_text(2000)
Message2000 = optional_text(2000)
Link500 = optional_text(500)
Color50 = optional_text(50)
Hashtag255 = optional_text(255)
ModerationComment500 = optional_text(500)

# Код подтверждения и токен обновления: без границы в поле можно прислать
# сколько угодно данных, и они попадут в запрос к базе.
OtpCode = Annotated[str, StringConstraints(strip_whitespace=True, min_length=4, max_length=10)]
Token2048 = Annotated[str, StringConstraints(min_length=1, max_length=2048)]

# ── Числа ──
Latitude = Annotated[float, Field(ge=-90, le=90)]
Longitude = Annotated[float, Field(ge=-180, le=180)]
# Цена: 10 знаков до точки — предел колонки Numeric(12, 2).
Price = Annotated[Decimal, Field(ge=0, le=Decimal("9999999999.99"))]
Percent = Annotated[Decimal, Field(ge=0, le=100)]
Quantity = Annotated[int, Field(ge=1, le=1_000_000)]

# Координаты приходят как Decimal (колонки Numeric), поэтому нужны отдельные
# псевдонимы: раньше в широту проходило 9999 и падало 500-й от базы.
LatitudeDec = Annotated[Decimal, Field(ge=-90, le=90)]
LongitudeDec = Annotated[Decimal, Field(ge=-180, le=180)]

# Границы совпадают с колонками: количество — Numeric(12, 3), цена — Numeric(10, 2).
# Без верхней границы значение доходило до базы и падало 500-й.
QuantityDec = Annotated[Decimal, Field(gt=0, le=Decimal("999999999.999"))]
QuantityInt = Annotated[int, Field(ge=1, le=1_000_000)]
Money = Annotated[Decimal, Field(ge=0, le=Decimal("99999999.99"))]
