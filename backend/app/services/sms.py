import re

import httpx

from app.config import settings


def _normalize_phone(phone: str) -> str:
    """Оставляем только цифры — API ожидает номер без '+' и прочих символов."""
    return re.sub(r"\D", "", phone)


async def send_sms(phone: str, content: str) -> bool:
    """Отправляет SMS через sms.post.tm.

    Возвращает True при успехе, False — если отправка отключена или произошла ошибка.
    Ошибки не пробрасываются наружу, чтобы не ломать основной флоу (см. вариант A).
    """
    if not settings.SMS_ENABLED:
        return False

    if not settings.SMS_API_TOKEN:
        print("[SMS] SMS_API_TOKEN не задан, отправка пропущена")
        return False

    normalized = _normalize_phone(phone)

    try:
        async with httpx.AsyncClient(timeout=settings.SMS_TIMEOUT) as client:
            response = await client.post(
                settings.SMS_API_URL,
                headers={
                    "accept": "application/json",
                    "Authorization": f"Bearer {settings.SMS_API_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={"phone": int(normalized), "content": content},
            )
        response.raise_for_status()
        return True
    except httpx.HTTPStatusError as exc:
        # Сервис ответил, но отказал: тело ответа объясняет причину (токен,
        # формат номера, лимит).
        print(
            f"[SMS] Не удалось отправить SMS на {phone}: "
            f"HTTP {exc.response.status_code} {exc.response.text[:200]}"
        )
        return False
    except Exception as exc:
        # Тип ошибки обязателен: у таймаута и обрыва соединения текст пустой,
        # и в журнале оставалось «Не удалось отправить SMS на …:» без причины.
        # Из-за этого не было видно, что адрес сервиса недоступен с сервера.
        print(f"[SMS] Не удалось отправить SMS на {phone} ({settings.SMS_API_URL}): {type(exc).__name__} {exc}")
        return False
