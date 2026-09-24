"""Что включено в этой установке.

Склад платформы (FBO) можно выключить (`FBO_ENABLED=false`) — тогда платформа
товар на хранение не принимает: приёмок и складов нет, новые магазины
работают только по FBS. Выключенный раздел на бэкенде ничего не говорит
витрине и админке, поэтому они спрашивают состояние здесь.

Чтобы флаг был один, а не три копии в трёх `.env`, фронтенды спрашивают
состояние здесь. Ручка публичная: витрине нужно знать это до входа.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

router = APIRouter()


class Features(BaseModel):
    """Возможности, которые фронтенды показывают или прячут."""

    #: Склад платформы (FBO): приёмки, склады, остатки на складах платформы.
    #: Выключен — разделы скрыты, новый магазин выбрать FBO не может. Учёт
    #: FBS (остатки, которые ведёт сам магазин) включён всегда.
    fbo_enabled: bool


@router.get("/", response_model=Features, summary="Enabled features")
async def read_features() -> Features:
    return Features(fbo_enabled=settings.FBO_ENABLED)
