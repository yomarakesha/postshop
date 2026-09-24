import type { Href } from "expo-router";

/**
 * Куда ведёт уведомление — или `null`, если вести некуда.
 *
 * Уведомление сообщало о событии и на этом заканчивалось. «Статус заказа
 * изменился» — а какого заказа, человек искал сам.
 *
 * `entity_id` у каждого вида указывает на свою таблицу (внешнего ключа в
 * модели нет именно поэтому), так что соответствие задаётся здесь по видам,
 * а не выводится из данных. Тот же разбор, что и на витрине
 * (`shared/lib/notificationTarget.ts`).
 *
 * Виды продавца ведут в кабинет магазина. Приложение показывает кабинет
 * только в режиме продавца, и переключать режим по нажатию на уведомление
 * нельзя — человек оказался бы в чужом интерфейсе, не поняв почему. Поэтому
 * такие уведомления остаются текстом, пока покупатель в клиентском режиме.
 */
export const notificationTarget = (
  kind: Notification.Kind,
  entityId: number | null,
): Href | null => {
  switch (kind) {
    // Покупателю.
    case "order_status":
    case "order_shop_rejected":
      return entityId
        ? { pathname: "/(client-tabs)/(orders)/order/[id]", params: { id: String(entityId) } }
        : "/(client-tabs)/(orders)";

    case "product_approved":
    case "product_declined":
      return entityId
        ? { pathname: "/products/[id]", params: { id: String(entityId) } }
        : null;

    case "shop_approved":
      return entityId
        ? { pathname: "/shops/[id]", params: { id: String(entityId) } }
        : null;

    // Отклонённый или закрытый магазин не открывается — вести туда некуда.
    case "shop_rejected":
    case "shop_blocked":
      return null;

    // Возвраты и отзывы: экранов для них в приложении пока нет, ссылка в
    // пустоту хуже её отсутствия.
    case "return_approved":
    case "return_rejected":
    case "return_received":
    case "review_approved":
    case "review_rejected":
    case "review_received":
      return null;

    // Виды продавца — см. пояснение выше.
    case "order_created":
    case "order_cancelled":
    case "receipt_confirmed":
    case "product_out_of_stock":
      return null;

    default:
      return null;
  }
};

/** Виды, где `comment` — код статуса заказа, а не текст человека. */
export const STATUS_COMMENT_KINDS = new Set<Notification.Kind>([
  "order_status",
]);
