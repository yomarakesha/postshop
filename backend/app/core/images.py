"""Единая нормализация загружаемых изображений.

Раньше каждый роутер (товары, бренды, баннеры, категории, логотипы магазинов)
делал одно и то же в две строки:

    image = Image.open(BytesIO(content))
    image.save(filepath, format="WEBP")

то есть сохранял файл ровно таким, каким его прислал клиент: без ограничения
размера, без ограничения стороны, без учёта EXIF-ориентации и без приведения
цветового режима. Практические последствия:

* снимок с телефона (6000×4000, 15–20 МБ) попадал в каталог целиком — карточка
  товара тянула десятки мегабайт на одну картинку;
* снимки в портретной ориентации показывались повёрнутыми: ориентация лежит в
  EXIF, а WEBP этот тег не переносит;
* PNG с прозрачностью и файлы в CMYK/палитре либо роняли сохранение, либо
  давали чёрный фон;
* «изображением» мог оказаться любой файл, а сообщение об ошибке приходило от
  Pillow и ничего не объясняло.
"""
import os
from typing import Iterable

from io import BytesIO

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 МБ на файл
MAX_IMAGE_DIMENSION = 1600         # длинная сторона после уменьшения
WEBP_QUALITY = 82

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"}


def normalize_image(content: bytes, filename: str = "image") -> Image.Image:
    """Открывает и приводит изображение к виду, пригодному для каталога.

    Проверяет размер, применяет EXIF-поворот, переводит в RGB и уменьшает
    длинную сторону до ``MAX_IMAGE_DIMENSION``. Все ошибки превращаются в 400
    с понятным текстом — клиенту важно знать, что именно не так с файлом.
    """
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Image {filename} is too large ({len(content) // (1024 * 1024)} MB), "
                   f"limit is {MAX_IMAGE_SIZE // (1024 * 1024)} MB",
        )

    try:
        image = Image.open(BytesIO(content))
        image.load()
    except Image.DecompressionBombError:
        raise HTTPException(
            status_code=400,
            detail=f"Image {filename} has too many pixels and was rejected",
        )
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file {filename}: {exc}")

    # Ориентация из EXIF применяется к самим пикселям: WEBP тег не сохраняет,
    # поэтому иначе портретные снимки показываются на боку.
    image = ImageOps.exif_transpose(image)

    # WEBP не работает с палитрой и CMYK, поэтому приводим режим. Прозрачность
    # СОХРАНЯЕМ: WEBP её умеет. Раньше альфа заливалась белым, и у иконки со
    # скруглёнными углами появлялась белая рамка — на любом небелом фоне она
    # видна, а сама скруглённая форма пропадала. Плоское белое годилось только
    # для форматов без альфы, а WEBP к ним не относится.
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
    elif image.mode != "RGB":
        image = image.convert("RGB")

    image.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.LANCZOS)
    return image


def save_webp(image: Image.Image, filepath: str, filename: str = "image") -> None:
    """Сохраняет подготовленное изображение в WEBP, с прозрачностью если она есть."""
    try:
        image.save(
            filepath,
            format="WEBP",
            quality=WEBP_QUALITY,
            method=4,
            # Без этого Pillow пишет альфу с потерями и по краям появляется
            # грязь; для иконок с чёткой границей это заметно.
            exact=image.mode == "RGBA",
        )
    except OSError as exc:
        raise HTTPException(status_code=400, detail=f"Could not save image {filename}: {exc}")


def process_upload(content: bytes, filepath: str, filename: str = "image") -> None:
    """Нормализовать и сохранить один файл — самый частый случай."""
    save_webp(normalize_image(content, filename), filepath, filename)


def check_content_type(file: UploadFile) -> None:
    """Отсечь заведомо не-картинки до чтения тела запроса."""
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type {file.content_type} for {file.filename}. "
                   f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}",
        )


def remove_files(paths: Iterable[str | None]) -> None:
    """
    Удаляет файлы с диска, молча пропуская отсутствующие.

    Вызывать ПОСЛЕ db.commit(). Пять мест делали наоборот — сначала стирали
    файл, потом фиксировали транзакцию, — и при неудачном коммите в базе
    оставались ссылки на несуществующие файлы, а старое изображение было уже
    не восстановить. Обратный порядок в худшем случае оставляет на диске
    осиротевший файл: это лечится уборкой, а битая ссылка — нет.
    """
    for path in paths:
        if not path:
            continue
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            pass
