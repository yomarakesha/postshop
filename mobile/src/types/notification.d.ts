declare namespace Notification {
  /**
   * Вид уведомления. Совпадает с `NotificationKind` бэкенда — по нему же
   * выбирается подпись (`notifications.kind.*`) и экран, куда вести.
   */
  type Kind =
    | 'product_approved'
    | 'product_declined'
    | 'shop_approved'
    | 'shop_rejected'
    | 'shop_blocked'
    | 'order_status'
    | 'order_created'
    | 'order_cancelled'
    | 'order_shop_rejected'
    | 'receipt_confirmed'
    | 'product_out_of_stock'
    | 'review_approved'
    | 'review_rejected'
    | 'review_received'
    | 'return_approved'
    | 'return_rejected'
    | 'return_received'
    | 'return_completed'
    | 'product_blocked'
    | 'order_approved_delivery'
    | 'withdrawal_completed'
    | 'withdrawal_rejected'

  type Item = {
    id: number
    kind: Kind
    /**
     * На что указывает уведомление. Таблица зависит от вида — внешнего ключа
     * в модели нет именно поэтому, и соответствие задаётся на клиенте.
     */
    entity_id: number | null
    /** Текст модератора либо код статуса заказа — зависит от вида. */
    comment: string | null
    is_read: boolean
    /** Может не прийти: в ответе сервера поле необязательное. */
    created_at: string | null
  }

  type UnreadCount = { count: number }

  namespace API {
    type ListVars = {
      skip?: number
      limit?: number
      unread_only?: boolean
    }
  }
}
