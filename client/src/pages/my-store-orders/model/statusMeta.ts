import { CheckCheck, CircleCheck, CircleX, Clock, PackageCheck, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { OrderResponse } from '#/shared/openapi/requests/types.gen'
import {
  LocalOrderStatusCode,
  OrderStatusCode,
  WarehouseType,
} from '#/shared/openapi/requests/types.gen'
import { orderStatusKey } from '#/shared/lib/orderStatus'

export const orderStatusIcon: Record<OrderStatusCode, LucideIcon> = {
  [OrderStatusCode.PENDING]: Clock,
  [OrderStatusCode.APPROVED]: CircleCheck,
  [OrderStatusCode.REJECTED]: CircleX,
  [OrderStatusCode.READY_TO_TAKE]: PackageCheck,
  [OrderStatusCode.READY_TO_DELIVER]: Truck,
  [OrderStatusCode.COMPLETED]: CheckCheck,
}

export const orderStatusColor: Record<OrderStatusCode, string> = {
  [OrderStatusCode.PENDING]: 'text-warning',
  [OrderStatusCode.APPROVED]: 'text-blue-main',
  [OrderStatusCode.REJECTED]: 'text-failure',
  [OrderStatusCode.READY_TO_TAKE]: 'text-success',
  [OrderStatusCode.READY_TO_DELIVER]: 'text-success',
  [OrderStatusCode.COMPLETED]: 'text-success',
}

// LocalOrderStatusCode (a shop's own progress on an order) is a subset of
// OrderStatusCode with identical string values, so the maps above cover it too.
export const getStatusIcon = (code: OrderStatusCode | LocalOrderStatusCode) =>
  orderStatusIcon[code as OrderStatusCode]

export const getStatusColor = (code: OrderStatusCode | LocalOrderStatusCode) =>
  orderStatusColor[code as OrderStatusCode]

/**
 * Что показывать продавцу крупным статусом — в списке и в подробностях.
 *
 * Раньше продавец видел только свою часть заказа (`order_shops.status`), а она
 * заканчивается на «Собран»: дальше заказ ведёт оператор, и часть магазина
 * больше не меняется. Покупатель уже получил заказ, а в кабинете продавца
 * навсегда оставалось «Готов к выдаче». Поэтому своя часть показывается, только
 * пока продавцу есть что делать — в одобренном оператором заказе; до одобрения
 * и после сборки главным становится общий статус, с теми же подписями, что
 * видит покупатель.
 *
 * Часть FBO собирает склад Postshop: подписи «примите», «соберите» обращены к
 * продавцу, которому там делать нечего, — ему хватит общего статуса.
 *
 * Исключение — часть, от которой магазин отказался, в заказе, который живёт
 * дальше без неё: «Доставлен» у продавца, который ничего не отправлял, соврал
 * бы. Если же отклонён весь заказ, показывается общее «Отклонён».
 */
export const sellerOrderStatus = (order: OrderResponse, storeId: number) => {
  const part = order.order_shops?.find((os) => os.shop_base_id === storeId)
  const isFboPart = part?.warehouse_type === WarehouseType.FBO
  const orderCode = order.order_status.code

  const showPart =
    part !== undefined &&
    (part.status === LocalOrderStatusCode.REJECTED
      ? orderCode !== OrderStatusCode.REJECTED
      : orderCode === OrderStatusCode.APPROVED && !isFboPart)

  return {
    part,
    isFboPart,
    code: showPart ? part.status : orderCode,
    labelKey: showPart
      ? `storeOrders.status.${part.status}`
      : orderStatusKey(orderCode, order.delivery_method),
  }
}
