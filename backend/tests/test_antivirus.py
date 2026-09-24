"""
Антивирус документов магазина (app/core/antivirus.py).

Проверяется напрямую против clamd: заражённый файл отклоняется, чистый
проходит с отметкой «проверен», а при недоступном clamd загрузка не
принимается молча. Если clamd локально не запущен
(`./update.py local` поднимает контейнер postshop-clamav), тесты с ним
пропускаются — но проверка «недоступен → отказ» идёт всегда.
"""

import asyncio
import socket

import pytest
from fastapi import HTTPException

from app.config import settings
from app.core.antivirus import ScanStatus, scan_document

# Стандартная безопасная тестовая строка EICAR: антивирусы обязаны считать её
# вирусом, вреда она не несёт.
EICAR = rb"X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
CLEAN_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _clamd_ready() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 3310), timeout=2) as conn:
            conn.sendall(b"zPING\0")
            return conn.recv(16).startswith(b"PONG")
    except OSError:
        return False


@pytest.fixture
def clamd_mode(monkeypatch):
    monkeypatch.setattr(settings, "ANTIVIRUS_MODE", "clamd")
    monkeypatch.setattr(settings, "CLAMD_HOST", "127.0.0.1")
    monkeypatch.setattr(settings, "CLAMD_PORT", 3310)


def test_off_mode_marks_file_not_scanned(monkeypatch):
    monkeypatch.setattr(settings, "ANTIVIRUS_MODE", "off")
    assert asyncio.run(scan_document(CLEAN_PDF, "a.pdf")) is ScanStatus.not_scanned


def test_unreachable_antivirus_refuses_upload(monkeypatch, clamd_mode):
    """Недоступный антивирус — отказ, а не молчаливый пропуск без проверки."""
    monkeypatch.setattr(settings, "CLAMD_PORT", 1)
    with pytest.raises(HTTPException) as caught:
        asyncio.run(scan_document(CLEAN_PDF, "a.pdf"))
    assert caught.value.status_code == 503


@pytest.mark.skipif(not _clamd_ready(), reason="clamd не запущен на 127.0.0.1:3310")
def test_infected_file_is_rejected(clamd_mode):
    with pytest.raises(HTTPException) as caught:
        asyncio.run(scan_document(EICAR, "passport.pdf"))
    assert caught.value.status_code == 400


@pytest.mark.skipif(not _clamd_ready(), reason="clamd не запущен на 127.0.0.1:3310")
def test_clean_file_is_marked_scanned(clamd_mode):
    assert asyncio.run(scan_document(CLEAN_PDF, "passport.pdf")) is ScanStatus.clean
