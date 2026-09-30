"""
Штрихкоды товара.

У товара их два:

- `barcode` — штрихкод Postshop. Выдаёт платформа, у каждого товара он есть
  и не повторяется. EAN-13 с префиксом 200: диапазон 20–29 GS1 оставлен для
  внутреннего использования, поэтому с заводскими кодами он не пересечётся.
  Его печатают на этикетке и сканируют на складе при приёмке и сборке.
  Строится из номера товара: `200` + номер (9 цифр) + контрольная цифра — ни
  счётчика, ни повторных попыток при совпадении не нужно.
- `vendor_barcode` — заводской штрихкод с упаковки. Необязательный, вводит
  продавец. Уникален в пределах магазина: одинаковый товар у двух магазинов
  законно носит один и тот же заводской код.
"""

from fastapi import HTTPException

PLATFORM_PREFIX = "200"
VENDOR_LENGTHS = (8, 12, 13, 14)  # EAN-8, UPC-A, EAN-13, GTIN-14


def ean13_check_digit(first12: str) -> str:
    total = sum(int(d) * (3 if i % 2 else 1) for i, d in enumerate(first12))
    return str((10 - total % 10) % 10)


def platform_barcode(product_id: int) -> str:
    body = f"{PLATFORM_PREFIX}{product_id:09d}"
    return body + ean13_check_digit(body)


def normalize_vendor_barcode(value: str | None) -> str | None:
    """Пустое поле — «штрихкода нет»; иначе только цифры нужной длины.

    Пустая строка хранится как NULL: уникальный индекс (магазин, штрихкод)
    пропускает сколько угодно NULL, но только одну пустую строку.
    """
    if value is None:
        return None
    cleaned = value.replace(" ", "").strip()
    if not cleaned:
        return None
    if not cleaned.isdigit() or len(cleaned) not in VENDOR_LENGTHS:
        raise HTTPException(
            status_code=422,
            detail="vendor_barcode: 8, 12, 13 or 14 digits (EAN-8, UPC-A, EAN-13, GTIN-14)",
        )
    return cleaned
