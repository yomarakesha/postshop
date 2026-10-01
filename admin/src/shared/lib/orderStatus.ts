import { OrderStatusCode } from '@/shared/openapi/requests'
import type { LocalOrderStatusCode, OrderResponse } from '@/shared/openapi/requests'

type AnyOrderStatus = OrderStatusCode | LocalOrderStatusCode
type DeliveryMethod = OrderResponse['delivery_method']
type Translate = (key: string) => string

export const orderStatusBadgeVariant: Record<
  OrderStatusCode,
  'warning' | 'info' | 'destructive' | 'success' | 'default'
> = {
  [OrderStatusCode.PENDING]: 'warning',
  [OrderStatusCode.APPROVED]: 'info',
  [OrderStatusCode.REJECTED]: 'destructive',
  [OrderStatusCode.READY_TO_TAKE]: 'info',
  [OrderStatusCode.READY_TO_DELIVER]: 'info',
  [OrderStatusCode.COMPLETED]: 'success',
}

/**
 * Статусы, смысл которых зависит от способа получения заказа.
 *
 * Раньше у всех заказов было одно «Готов к доставке» → «Завершить», и
 * оператор видел «доставку» у заказа из пункта выдачи. Для самовывоза это
 * «Ждёт в пункте выдачи» → «Выдан покупателю», для доставки — «Передан в
 * доставку» → «Доставлен».
 */
const METHOD_SPECIFIC = new Set<AnyOrderStatus>([
  OrderStatusCode.READY_TO_DELIVER,
  OrderStatusCode.COMPLETED,
])

/**
 * Подпись статуса заказа или части заказа. Без способа получения (сводка на
 * главной, где заказы смешаны) — нейтральная подпись.
 */
export function orderStatusLabel(t: Translate, code: AnyOrderStatus, method?: DeliveryMethod) {
  if (method && METHOD_SPECIFIC.has(code)) return t(`orders.statusLabelBy.${method}.${code}`)
  return t(`orders.statusLabel.${code}`)
}

/**
 * Подпись кнопки, переводящей заказ В статус `target`. Кнопка называет
 * событие, которое произошло («Собран», «Выдан покупателю»), а не прежнее
 * безликое «Готов к доставке» / «Завершить».
 */
export function orderActionLabel(t: Translate, target: AnyOrderStatus, method?: DeliveryMethod) {
  if (method && METHOD_SPECIFIC.has(target)) return t(`orders.actionBy.${method}.${target}`)
  return t(`orders.action.${target}`)
}
