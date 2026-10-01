import { describe, expect, it } from 'vitest'
import { sellerOrderStatus } from './statusMeta'
import type { OrderResponse } from '#/shared/openapi/requests/types.gen'
import { orderStatusKey } from '#/shared/lib/orderStatus'
import {
  LocalOrderStatusCode,
  OrderStatusCode,
  WarehouseType,
} from '#/shared/openapi/requests/types.gen'

const STORE = 7

const order = (
  code: OrderStatusCode,
  part: LocalOrderStatusCode,
  { fbo = false, method = 'pickup' as const } = {},
) =>
  ({
    order_status: { code, translations: [] },
    delivery_method: method,
    order_shops: [
      {
        shop_base_id: STORE,
        status: part,
        warehouse_type: fbo ? WarehouseType.FBO : WarehouseType.FBS,
      },
    ],
  }) as unknown as OrderResponse

/**
 * Инцидент: заказ с самовывозом покупатель уже получил («Завершён»), а у
 * продавца навсегда осталось «Готов к выдаче» — кабинет показывал только его
 * часть заказа, которая после сборки больше не меняется.
 */
describe('orderStatusKey', () => {
  it('различает самовывоз и доставку на двух последних этапах', () => {
    expect(orderStatusKey(OrderStatusCode.READY_TO_DELIVER, 'pickup')).toBe(
      'orderStatus.pickup.ready_to_deliver',
    )
    expect(orderStatusKey(OrderStatusCode.COMPLETED, 'delivery')).toBe(
      'orderStatus.delivery.completed',
    )
  })

  it('без способа получения — нейтральная подпись', () => {
    expect(orderStatusKey(OrderStatusCode.COMPLETED)).toBe('orderStatus.completed')
  })

  it('ранние этапы от способа не зависят', () => {
    expect(orderStatusKey(OrderStatusCode.READY_TO_TAKE, 'pickup')).toBe(
      'orderStatus.ready_to_take',
    )
  })
})

describe('sellerOrderStatus', () => {
  it('пока оператор не одобрил — общий статус', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.PENDING, LocalOrderStatusCode.PENDING),
      STORE,
    )
    expect(view.code).toBe(OrderStatusCode.PENDING)
    expect(view.labelKey).toBe('orderStatus.pending')
  })

  it('в одобренном заказе — своя часть', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.APPROVED, LocalOrderStatusCode.APPROVED),
      STORE,
    )
    expect(view.labelKey).toBe('storeOrders.status.approved')
  })

  it('после сборки — общий статус, а не застрявшая часть', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.COMPLETED, LocalOrderStatusCode.READY_TO_TAKE),
      STORE,
    )
    expect(view.code).toBe(OrderStatusCode.COMPLETED)
    expect(view.labelKey).toBe('orderStatus.pickup.completed')
  })

  it('часть FBO в одобренном заказе — общий статус, без призывов к продавцу', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.APPROVED, LocalOrderStatusCode.PENDING, { fbo: true }),
      STORE,
    )
    expect(view.isFboPart).toBe(true)
    expect(view.labelKey).toBe('orderStatus.approved')
  })

  it('свой отказ виден, даже когда заказ без этой части ушёл дальше', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.COMPLETED, LocalOrderStatusCode.REJECTED),
      STORE,
    )
    expect(view.labelKey).toBe('storeOrders.status.rejected')
  })

  it('отклонён весь заказ — общее «Отклонён»', () => {
    const view = sellerOrderStatus(
      order(OrderStatusCode.REJECTED, LocalOrderStatusCode.REJECTED),
      STORE,
    )
    expect(view.labelKey).toBe('orderStatus.rejected')
  })
})
