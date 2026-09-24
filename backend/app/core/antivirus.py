"""Проверка загружаемых документов антивирусом (ClamAV через clamd).

Документы магазина открывает сотрудник платформы у себя на компьютере.
Проверка формата отсекает подделку типа — исполняемый файл под именем
passport.pdf, — но не заражённый настоящий PDF или картинку. Для этого
файл до записи на диск отправляется в clamd.

Режимы (`ANTIVIRUS_MODE`):

* ``off`` — проверки нет, документ сохраняется с пометкой «не проверен».
  Так админка честно показывает, что файл антивирус не видел;
* ``clamd`` — проверка обязательна. Если clamd недоступен, загрузка
  отклоняется (503): молча пропустить файл без проверки значило бы, что
  пометка «проверен» ничего не гарантирует.

Протокол — INSTREAM: файл уходит частями с длиной перед каждой, ответ
«stream: OK» или «stream: <сигнатура> FOUND». Отдельная библиотека для
этого не нужна.
"""

import asyncio
import enum
import logging
import struct

from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

_CHUNK = 64 * 1024


class ScanStatus(str, enum.Enum):
    #: clamd проверил файл и ничего не нашёл.
    clean = "clean"
    #: Проверка выключена или файл загружен до её появления.
    not_scanned = "not_scanned"


async def _instream(content: bytes) -> str:
    reader, writer = await asyncio.open_connection(settings.CLAMD_HOST, settings.CLAMD_PORT)
    try:
        writer.write(b"zINSTREAM\0")
        for start in range(0, len(content), _CHUNK):
            chunk = content[start:start + _CHUNK]
            writer.write(struct.pack("!L", len(chunk)) + chunk)
            await writer.drain()
        writer.write(struct.pack("!L", 0))
        await writer.drain()
        reply = await reader.readuntil(b"\0")
        return reply.rstrip(b"\0").decode("utf-8", errors="replace").strip()
    finally:
        writer.close()


async def scan_document(content: bytes, filename: str) -> ScanStatus:
    """Проверяет файл; заражённый или непроверяемый отклоняет исключением."""
    if settings.ANTIVIRUS_MODE != "clamd":
        return ScanStatus.not_scanned

    try:
        reply = await asyncio.wait_for(_instream(content), timeout=settings.ANTIVIRUS_TIMEOUT)
    except (OSError, asyncio.TimeoutError, asyncio.IncompleteReadError) as exc:
        logger.error("Антивирус недоступен (%s:%s): %r",
                     settings.CLAMD_HOST, settings.CLAMD_PORT, exc)
        raise HTTPException(
            status_code=503,
            detail="Antivirus check is unavailable, please try again later",
        )

    if reply.endswith("OK"):
        return ScanStatus.clean
    if reply.endswith("FOUND"):
        signature = reply.removeprefix("stream:").removesuffix("FOUND").strip()
        logger.warning("Антивирус отклонил документ %r: %s", filename, signature)
        raise HTTPException(
            status_code=400,
            detail=f"File {filename} was rejected by the antivirus check",
        )
    # «INSTREAM size limit exceeded» и прочие ошибки clamd: файл не проверен,
    # значит, и не принят.
    logger.error("Антивирус не смог проверить %r: %s", filename, reply)
    raise HTTPException(
        status_code=503,
        detail="Antivirus check failed, please try again later",
    )
