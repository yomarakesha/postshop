"""
Время бизнеса — Ашхабад (UTC+5), а в базе всё хранится в UTC.

«Сегодня», «эта неделя» и разбивка выручки по дням считались по часам
сервера, то есть по UTC: заказ, оформленный в Ашхабаде в 03:00, попадал во
вчерашний день, а неделя начиналась в понедельник в 05:00 по местному.
"""

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import func

from app.config import settings

BUSINESS_TZ = ZoneInfo(settings.BUSINESS_TIMEZONE)


def local_now() -> datetime:
    return datetime.now(BUSINESS_TZ)


def local_midnight_utc(day: date) -> datetime:
    """Начало местных суток `day` — как момент в UTC, для сравнения с базой."""
    return datetime.combine(day, time.min, tzinfo=BUSINESS_TZ).astimezone(timezone.utc)


def _utc_offset(moment: datetime) -> str:
    offset = moment.astimezone(BUSINESS_TZ).utcoffset() or timedelta(0)
    minutes = int(offset.total_seconds() // 60)
    sign = "+" if minutes >= 0 else "-"
    minutes = abs(minutes)
    return f"{sign}{minutes // 60:02d}:{minutes % 60:02d}"


def local_date_expr(column):
    """SQL: местная дата UTC-колонки.

    CONVERT_TZ со смещением, а не с именем зоны: таблицы зон в MySQL обычно не
    загружены, а в Туркменистане нет перехода на летнее время.
    """
    return func.date(func.convert_tz(column, "+00:00", _utc_offset(local_now())))
