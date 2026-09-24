from pydantic import BaseModel

from app.schemas.product import ProductResponse
from app.schemas.shop_base import ShopFullResponse
from app.schemas.category import CategoryShort
from app.schemas.brand import BrandResponse


class SearchResponse(BaseModel):
    """Ответ общего поиска по маркетплейсу (в рамках выбранного города).

    products  — основная выдача товаров (фильтры + релевантность + пагинация);
    shops/categories/brands — короткие подсказки по запросу `q` (без пагинации,
    пустые, если `q` не задан).
    """
    products:   list[ProductResponse] = []
    shops:      list[ShopFullResponse] = []
    categories: list[CategoryShort]    = []
    brands:     list[BrandResponse]    = []
