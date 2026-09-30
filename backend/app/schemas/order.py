import enum
from app.models.shop_additional import WarehouseType
from pydantic import BaseModel, Field, computed_field, model_validator
from datetime import date as date_type, datetime
from decimal import Decimal
from typing import List, Optional
from app.models.order import PaymentType
from app.models.order_status import OrderStatusCode
from app.models.order_shop import LocalOrderStatusCode
from app.schemas.product import ProductResponse, ProductTranslationResponse
from app.schemas.order_status import OrderStatusResponse
from app.schemas.pickup_point import PickupPointResponse
from app.schemas.shop_base import ShopFullResponse
from app.schemas.user import UserDetailResponse
from app.schemas.common import Address500, Comment1000, Money


class OrderCreate(BaseModel):
    payment_type:     PaymentType
    delivery_address: Optional[Address500] = None
    pickup_point_id:  Optional[int] = None
    comment:          Optional[Comment1000] = None

    @model_validator(mode="after")
    def check_delivery_method(self):
        if self.delivery_address is None and self.pickup_point_id is None:
            raise ValueError("Either delivery_address or pickup_point_id must be provided")
        return self


class OrderStatusUpdate(BaseModel):
    status_code: OrderStatusCode
    comment:     Optional[Comment1000] = None
    # Цена доставки: принимается только при переводе в approved. Для заказа
    # с delivery_address обязательна, для самовывоза не применима (роут вернёт 400).
    delivery_price: Optional[Money] = None


class ShopOrderStatusUpdate(BaseModel):
    """Смена локального статуса части заказа магазином."""
    status_code: LocalOrderStatusCode
    comment:     Optional[Comment1000] = None


class OrderCancelRequest(BaseModel):
    """Отмена заказа покупателем (опциональная причина)."""
    reason: Optional[Comment1000] = None


class TopProductResponse(BaseModel):
    """Позиция топа продаж магазина: товар + сколько продано и на какую сумму."""
    product:        ProductResponse
    total_quantity: int
    total_revenue:  Decimal


class DailyRevenue(BaseModel):
    """Доход магазина за один день недели."""
    date:          date_type
    orders_count:  int
    total_revenue: Decimal


class SummaryPeriod(str, enum.Enum):
    """
    За какой срок считаем. Три значения, а не произвольные даты: продавцу нужен
    не конструктор отчётов, а ответ на «как дела» — и три варианта его дают.
    """

    week = "week"
    month = "month"
    quarter = "quarter"


class SummaryTotals(BaseModel):
    """Итоги одного периода. Те же поля у текущего и у предыдущего."""

    orders_count: int
    total_revenue: Decimal
    # Выручка без числа заказов не говорит ничего: тысяча — это один крупный
    # заказ или сорок мелких. Средний чек отвечает на это сразу.
    average_check: Decimal
    # Части заказа, которые магазин отклонил сам. Растущая доля — сигнал, что
    # цена, наличие или сроки не сходятся, и продавец теряет деньги, не понимая
    # почему.
    rejected_count: int
    rejected_share: Decimal


class SummaryPoint(BaseModel):
    """Точка графика. Для недели и месяца это день, для квартала — неделя."""

    date: date_type
    orders_count: int
    total_revenue: Decimal


class ShopSummaryResponse(BaseModel):
    """
    Сводка по магазину за период с сравнением с предыдущим таким же.

    Прежняя выдача считала только текущую неделю с понедельника: в понедельник
    утром продавец видел пустой график и решал, что всё сломалось. И главное —
    число без базы сравнения ничего не значит, поэтому рядом с каждым итогом
    идёт такой же за предыдущий период.
    """

    shop_id: int
    period: SummaryPeriod
    period_start: datetime
    period_end: datetime
    current: SummaryTotals
    previous: SummaryTotals
    points: list[SummaryPoint] = []


class UnsoldProduct(BaseModel):
    """
    Товар магазина без продаж за период.

    Отдаём переводы, а не готовое название: язык выбирает клиент — так же, как
    в топе продаж. Одно поле `name` пришло бы на том языке, который база вернёт
    первым, то есть на случайном.
    """

    product_id: int
    translations: List[ProductTranslationResponse] = []
    price: Decimal
    views_count: int
    rating_avg: Optional[Decimal] = None


class ReturnedProduct(BaseModel):
    """Товар, который возвращали. Один возврат — случайность, три — брак партии."""

    product_id: int
    translations: List[ProductTranslationResponse] = []
    returns_count: int
    quantity: Decimal


class ShopInsightsResponse(BaseModel):
    """
    Списки, по которым продавцу есть что сделать.

    Отдельно от сводки: та отвечает на «как дела», эта — на «что чинить».
    Смешивать их в одном ответе значило бы тянуть тяжёлые выборки каждый раз,
    когда человек просто переключает период на графике.
    """

    shop_id: int
    period_start: datetime
    period_end: datetime
    # Рейтинг магазина считался, но продавцу не показывался вообще.
    rating_avg: Optional[Decimal] = None
    rating_count: int = 0
    new_reviews: int = 0
    unsold: list[UnsoldProduct] = []
    returned: list[ReturnedProduct] = []


class ShopWeeklyRevenueResponse(BaseModel):
    """Суммарный доход магазина за текущую неделю (по completed-заказам).

    ``by_day`` — все семь дней недели по порядку, включая нулевые: без него в
    кабинете продавца был заголовок «Отчёт по доходам» и пустое место вместо
    графика, а сам график лежал в коде закомментированным, потому что дневной
    разбивки в ответе не было.
    """
    shop_id:       int
    period_start:  datetime
    period_end:    datetime
    orders_count:  int
    total_revenue: Decimal
    by_day:        list[DailyRevenue] = []


class OrderItemResponse(BaseModel):
    id:             int
    product_id:     int
    product:        ProductResponse
    quantity:       int
    price_at_order: Decimal

    class Config:
        from_attributes = True


class OrderShopResponse(BaseModel):
    id:           int
    shop_base_id: int
    shop:         ShopFullResponse
    status:       LocalOrderStatusCode
    # Тип склада на момент заказа. FBO — часть собирает склад Postshop, и
    # статус ей меняет сотрудник, а не продавец.
    warehouse_type: Optional[WarehouseType] = None
    comment:      Optional[str] = None
    items:        list[OrderItemResponse]

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        """Стоимость части заказа этого магазина."""
        return sum((i.price_at_order * i.quantity for i in self.items), Decimal("0"))

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id:               int
    user_id:          int
    user:             UserDetailResponse
    order_status:     OrderStatusResponse
    payment_type:     PaymentType
    delivery_address: Optional[str]              = None
    delivery_price:   Optional[Decimal]          = None
    pickup_point:     Optional[PickupPointResponse] = None
    comment:          Optional[str]              = None
    items:            list[OrderItemResponse]
    shops:            list[ShopFullResponse]     = []
    order_shops:      list[OrderShopResponse]    = []
    created_at:       datetime
    updated_at:       datetime | None

    @computed_field
    @property
    def total(self) -> Decimal:
        """Полная стоимость заказа (все позиции, включая отклонённые магазины)."""
        return sum((i.price_at_order * i.quantity for i in self.items), Decimal("0"))

    @computed_field
    @property
    def effective_total(self) -> Decimal:
        """Сумма к оплате: без частей отклонённых магазинов (частичное выполнение),
        плюс цена доставки, если назначена (NULL — не назначена или самовывоз)."""
        return sum(
            (s.subtotal for s in self.order_shops if s.status != LocalOrderStatusCode.rejected),
            Decimal("0"),
        ) + (self.delivery_price or Decimal("0"))

    @computed_field
    @property
    def has_rejected_shops(self) -> bool:
        return any(s.status == LocalOrderStatusCode.rejected for s in self.order_shops)

    @computed_field
    @property
    def all_shops_rejected(self) -> bool:
        return bool(self.order_shops) and all(
            s.status == LocalOrderStatusCode.rejected for s in self.order_shops
        )

    @computed_field
    @property
    def all_active_shops_ready(self) -> bool:
        """Все неотклонённые магазины дошли до ready_to_take (есть хотя бы один такой)."""
        active = [s for s in self.order_shops if s.status != LocalOrderStatusCode.rejected]
        return bool(active) and all(s.status == LocalOrderStatusCode.ready_to_take for s in active)

    class Config:
        from_attributes = True
