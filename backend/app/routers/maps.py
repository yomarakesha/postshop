"""
Своя раздача карты: векторные тайлы из MBTiles, шрифты подписей и иконки.

Сервер без интернета, а внешние картографические CDN из Туркменистана
открываются не всегда — поэтому всё отдаём сами. Стиль (слои и цвета) лежит в
`public/map_styles.json` витрины и админки; сюда они ходят за данными по
адресам `/v1/maps/...` (см. `shared/lib/mapStyle.ts`).

Доступ открытый, как у картинок в /uploads: тайлы — общедоступные данные OSM.
Нет файла карты — 404 на тайлы и одна запись в журнале, приложение работает.
"""

import logging
import re
import sqlite3
import threading
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

MAPS_DIR = Path(settings.MAPS_DIR)
MBTILES_PATH = MAPS_DIR / "turkmenistan-detail.mbtiles"
FONTS_DIR = MAPS_DIR / "fonts"

SPRITE_TYPES = {
    "sprite.json": "application/json",
    "sprite.png": "image/png",
    "sprite@2x.json": "application/json",
    "sprite@2x.png": "image/png",
}
# Имя шрифта приходит из URL и идёт в путь к файлу: только буквы, цифры,
# пробел и запятая (стек шрифтов), без точек и слешей.
FONTSTACK_RE = re.compile(r"^[A-Za-z0-9 ,_-]+$")
RANGE_RE = re.compile(r"^\d+-\d+$")

DAY = 86400

_db: sqlite3.Connection | None = None
_db_lock = threading.Lock()
_missing_logged = False


def _get_db() -> sqlite3.Connection | None:
    global _db, _missing_logged
    if _db is not None:
        return _db
    with _db_lock:
        if _db is None:
            if not MBTILES_PATH.exists():
                if not _missing_logged:
                    logger.error("Карта: нет файла %s — тайлы не раздаются", MBTILES_PATH.resolve())
                    _missing_logged = True
                return None
            _db = sqlite3.connect(f"file:{MBTILES_PATH}?mode=ro", uri=True, check_same_thread=False)
            logger.info("Карта: открыт %s", MBTILES_PATH.resolve())
    return _db


@router.get("/tiles/{z}/{x}/{y}.pbf")
def get_tile(z: int, x: int, y: int):
    if not (0 <= z <= 22 and 0 <= x < (1 << z) and 0 <= y < (1 << z)):
        raise HTTPException(status_code=404, detail="Tile not found")
    db = _get_db()
    if db is None:
        raise HTTPException(status_code=404, detail="Tile not found")
    # MBTiles хранит строки по схеме TMS: ось Y перевёрнута относительно XYZ.
    row = db.execute(
        "SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?",
        (z, x, (1 << z) - 1 - y),
    ).fetchone()
    if row is None:
        # Пустой тайл (за пределами страны) — норма; 204 не шумит в консоли браузера.
        return Response(status_code=204, headers={"Cache-Control": f"public, max-age={DAY}"})
    return Response(
        content=row[0],
        media_type="application/x-protobuf",
        # planetiler пишет тайлы уже сжатыми gzip.
        headers={"Content-Encoding": "gzip", "Cache-Control": f"public, max-age={DAY}"},
    )


@router.get("/fonts/{fontstack}/{range_str}.pbf")
def get_font(fontstack: str, range_str: str):
    if not FONTSTACK_RE.match(fontstack) or not RANGE_RE.match(range_str):
        raise HTTPException(status_code=404, detail="Font not found")
    # Стек «A,B» — берём первый шрифт, который есть.
    for name in (f.strip() for f in fontstack.split(",")):
        path = FONTS_DIR / name / f"{range_str}.pbf"
        if path.is_file():
            return Response(
                content=path.read_bytes(),
                media_type="application/x-protobuf",
                headers={"Cache-Control": f"public, max-age={7 * DAY}"},
            )
    raise HTTPException(status_code=404, detail="Font not found")


@router.get("/sprites/{filename}")
def get_sprite(filename: str):
    media_type = SPRITE_TYPES.get(filename)
    path = MAPS_DIR / filename
    if media_type is None or not path.is_file():
        raise HTTPException(status_code=404, detail="Sprite not found")
    return Response(
        content=path.read_bytes(),
        media_type=media_type,
        headers={"Cache-Control": f"public, max-age={7 * DAY}"},
    )
