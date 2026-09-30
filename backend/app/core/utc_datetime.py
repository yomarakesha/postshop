"""
Время в базе — всегда UTC, и в ответах API оно помечено как UTC.

MySQL-колонка DATETIME зоны не хранит, и aiomysql возвращает «голое» время.
Pydantic отдавал его без суффикса (`2026-09-23T05:50:00`), а браузер и
телефон читают такую строку как местное время — в Ашхабаде (UTC+5) всё
показывалось на пять часов раньше, чем было.

Тип колонки чинит это в одном месте, а не в каждой из десятков схем:
при записи осознанное время переводится в UTC и пишется без зоны, при чтении
значению возвращается зона UTC. Схемы отдают `...Z`, а приложения сами
переводят его в Asia/Ashgabat.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.types import TypeDecorator


class UTCDateTime(TypeDecorator):
    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect):
        if value is None or value.tzinfo is None:
            # Время без зоны в проекте всегда UTC: так пишет сервер.
            return value
        return value.astimezone(timezone.utc).replace(tzinfo=None)

    def process_result_value(self, value: datetime | None, dialect):
        if value is None or value.tzinfo is not None:
            return value
        return value.replace(tzinfo=timezone.utc)
