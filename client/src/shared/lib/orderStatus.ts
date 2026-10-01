import type { OrderResponse } from '#/shared/openapi/requests/types.gen'
import { OrderStatusCode } from '#/shared/openapi/requests/types.gen'

export type DeliveryMethod = OrderResponse['delivery_method']

/**
 * Ключ перевода для общего статуса заказа — один на всю витрину.
 *
 * Раньше подписи брались из `orders.status.<код>` (или из переводов на
 * сервере) и звучали как этапы работы оператора: «Готов к выдаче», «Готов к
 * доставке». Заказ с пунктом выдачи показывал «Готов к доставке» — то, чего с
 * ним не происходит вовсе. Два последних этапа значат разное в зависимости от
 * способа получения: при самовывозе заказ ждёт в пункте выдачи и его
 * «получают», при доставке его «передают в доставку» и «доставляют». Способ
 * сервер теперь отдаёт готовым (`delivery_method`). Где его нет (уведомление
 * о смене статуса), подпись нейтральная — «Готов к получению», «Завершён».
 *
 * rejected для покупателя — «Отменён»: этим кодом сервер записывает и отказ
 * оператора, и отмену самим покупателем, а «Отклонён» про собственную отмену
 * звучало бы как чужое решение.
 */
export const orderStatusKey = (
  code: OrderStatusCode,
  deliveryMethod?: DeliveryMethod | null,
): string =>
  deliveryMethod &&
  (code === OrderStatusCode.READY_TO_DELIVER || code === OrderStatusCode.COMPLETED)
    ? `orderStatus.${deliveryMethod}.${code}`
    : `orderStatus.${code}`
