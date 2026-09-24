import { NotificationKind } from '#/shared/openapi/requests'

/** Из профиля нужен только идентификатор магазина. */
interface ShopRef {
  id: number
}

/**
 * Куда ведёт уведомление — или `null`, если вести некуда.
 *
 * Уведомление сообщало о событии и на этом заканчивалось: клик только отмечал
 * его прочитанным. «Заказ №30 изменил статус» — а где этот заказ, человек
 * искал сам.
 *
 * `entity_id` у каждого вида указывает на свою таблицу (см. модель
 * Notification: внешнего ключа там нет как раз поэтому), поэтому соответствие
 * задаётся здесь по видам, а не выводится из данных.
 *
 * Виды продавца — отдельный случай: `entity_id` у них указывает на заказ,
 * товар или приёмку, а все маршруты кабинета начинаются с идентификатора
 * магазина. Сервер присылает его отдельным полем (`shop_base_id`); у
 * уведомлений, отправленных до этого, его нет — там магазин берётся из
 * профиля, если он единственный, иначе ссылка ведёт на выбор магазина.
 */
export function notificationTarget(
  kind: string,
  entityId: number | null | undefined,
  shops: Array<ShopRef> | null | undefined,
  shopBaseId?: number | null,
): string | null {
  // Магазин события приходит в самом уведомлении. Один магазин у человека —
  // он же и ответ; у старых уведомлений магазина нет, и с несколькими
  // магазинами остаётся выбор — угадывать нельзя.
  const shopId = shopBaseId ?? (shops?.length === 1 ? shops[0].id : null)
  const store = (path: string) => (shopId ? `/my-store/${shopId}${path}` : '/my-store')

  switch (kind) {
    // Покупателю: свои заказы и свои возвраты.
    // ORDER_SHOP_REJECTED — отказ магазина от части заказа: событие покупателя,
    // ведём туда же, куда и смену статуса, — в его заказы.
    case NotificationKind.ORDER_STATUS:
    case NotificationKind.ORDER_SHOP_REJECTED:
      return '/profile'
    case NotificationKind.RETURN_APPROVED:
    case NotificationKind.RETURN_REJECTED:
      return '/profile/returns'

    // Продавцу.
    case NotificationKind.ORDER_CREATED:
    case NotificationKind.ORDER_CANCELLED:
      return store('/orders')
    case NotificationKind.RECEIPT_CONFIRMED:
      return store('/receipts')
    // Раньше вести было некуда — экрана возвратов у продавца не существовало.
    case NotificationKind.RETURN_RECEIVED:
      return store('/returns')
    case NotificationKind.PRODUCT_APPROVED:
    case NotificationKind.PRODUCT_DECLINED:
      return entityId ? store(`/products/edit/${entityId}`) : store('/products')
    // Товар закончился: ведём в список товаров — там его пополняют или
    // снимают с продажи. Сразу на сам товар: у продавца их сотни, и искать
    // тот, про который уведомление, пришлось бы глазами.
    case NotificationKind.PRODUCT_OUT_OF_STOCK:
      return store(entityId ? `/products?product=${entityId}` : '/products')

    // Здесь entity_id — сам магазин, и искать его по профилю не нужно.
    case NotificationKind.SHOP_APPROVED:
    case NotificationKind.SHOP_BLOCKED:
      return entityId ? `/my-store/${entityId}` : '/my-store'
    // Отклонённый магазин в кабинет не пускает, поэтому ведём в профиль.
    case NotificationKind.SHOP_REJECTED:
      return '/profile'

    // Отзывы и полученные продавцом возвраты: страниц, на которых их видно, в
    // витрине нет. Ссылка в пустоту хуже её отсутствия — такие уведомления
    // остаются просто текстом.
    default:
      return null
  }
}
