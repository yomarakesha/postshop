from pathlib import Path
from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MYSQL_POOL_SIZE: int = 10
    MYSQL_MAX_OVERFLOW: int = 20
    MYSQL_POOL_TIMEOUT: int = 30
    MYSQL_POOL_RECYCLE: int = 1800

    SMS_API_URL: str = "https://sms.post.tm/api/clients/sms/create"
    SMS_API_TOKEN: str = ""
    SMS_ENABLED: bool = True
    SMS_TIMEOUT: int = 10

    # Часовой пояс, в котором живут продавцы и покупатели: по нему считаются
    # «сегодня» и «эта неделя» в статистике. В базе время хранится в UTC.
    BUSINESS_TIMEZONE: str = "Asia/Ashgabat"

    # Склад платформы (FBO): магазин отправляет товар на склад Postshop,
    # приёмку подтверждает сотрудник, остаток и списания ведёт платформа.
    # False — платформа товар не хранит: приёмки и склады закрыты, новые
    # магазины работают только по FBS. Учёт FBS (магазин сам ведёт остатки)
    # этим флагом не выключается — он есть всегда.
    #
    FBO_ENABLED: bool = True
    # Прежнее имя флага: раньше он назывался FBS_ENABLED и выключал оба учёта
    # сразу. Старая строка в .env должна читаться — неизвестные ключи настройки
    # отвергают, и приложение не запустилось бы. Действует, только если
    # FBO_ENABLED не задан.
    FBS_ENABLED: bool | None = None

    # Срок хранения уведомлений. На них не ссылается ни одна таблица, поэтому
    # росли они бесконечно: уборки не было ни фоновой, ни ручной, а старое
    # уведомление ценности не имеет — событие давно позади.
    NOTIFICATIONS_RETENTION_DAYS: int = 90

    # Сколько дней после завершения заказа можно подать заявку на возврат.
    RETURN_WINDOW_DAYS: int = 14
    # Как часто перебирать. 0 — уборку не запускать вовсе.
    NOTIFICATIONS_PURGE_INTERVAL_HOURS: int = 24

    # Проверка документов магазинов антивирусом (app/core/antivirus.py).
    # off — не проверять (документ помечается «не проверен»); clamd — проверять
    # обязательно, при недоступном clamd загрузка отклоняется.
    ANTIVIRUS_MODE: str = "off"
    CLAMD_HOST: str = "127.0.0.1"
    CLAMD_PORT: int = 3310
    ANTIVIRUS_TIMEOUT: int = 60

    # Карта (app/routers/maps.py): turkmenistan-detail.mbtiles, fonts/ и sprite*.
    # Путь относительный — от каталога запуска, как uploads. Файлы не в git:
    # их собирают отдельно (planetiler) и кладут на сервер руками.
    MAPS_DIR: str = "maps"

    class Config:
        env_file = _ENV_FILE

    def model_post_init(self, __context) -> None:
        if "FBO_ENABLED" not in self.model_fields_set and self.FBS_ENABLED is not None:
            self.FBO_ENABLED = self.FBS_ENABLED

settings = Settings()