import SuccessIcon from '@assets/icons/orderStatus/success.svg'
import PendingIcon from '@assets/icons/orderStatus/pending.svg'
import CancelledIcon from '@assets/icons/orderStatus/cancelled.svg'
import ProcessingIcon from '@assets/icons/orderStatus/processing.svg'
import ClockIcon from '@assets/icons/clock.svg'
import CheckIcon from '@assets/icons/circle-check.svg'
import PackageCheckIcon from '@assets/icons/package-check.svg'
import { UnistylesThemes } from 'react-native-unistyles'

const clientIcons: Record<Order.UIStatus, SvgType> = {
  pending: PendingIcon,
  in_progress: ProcessingIcon,
  cancelled: CancelledIcon,
  done: SuccessIcon,
}

const clientLabelKeys: Record<Order.UIStatus, string> = {
  pending: 'client.orders.status.pending',
  in_progress: 'client.orders.status.in_progress',
  cancelled: 'client.orders.status.cancelled',
  done: 'client.orders.status.done',
}

const shopLabelKeys: Record<Order.ShopOrderStatus, string> = {
  pending: 'store.orders.status.pending',
  ready_to_take: 'store.orders.status.ready_to_take',
  approved: 'store.orders.status.approved',
  rejected: 'store.orders.status.rejected',
}

const shopIcons: Record<Order.ShopOrderStatus, SvgType> = {
  pending: ClockIcon,
  ready_to_take: PackageCheckIcon,
  approved: CheckIcon,
  rejected: CancelledIcon,
}

const clientStatusMap: Record<Order.StatusCode, Order.UIStatus> = {
  pending: 'pending',
  approved: 'in_progress',
  ready_to_take: 'in_progress',
  ready_to_deliver: 'in_progress',
  rejected: 'cancelled',
  completed: 'done',
}

/**
 * Подпись общего статуса заказа для покупателя.
 *
 * Укрупнённая шкала (Ожидает / Готовится / Выполнен) прятала главное: заказ
 * с самовывозом на последнем шаге назывался «Готов к доставке», и человек
 * ждал курьера, хотя заказ лежал в пункте выдачи. Поэтому последние два шага
 * зависят от способа получения. Где он неизвестен (строка уведомления —
 * в ней только код статуса), берём нейтральные «Готов к получению» /
 * «Завершён». Те же подписи — на витрине.
 */
const getBuyerLabelKey = (
  code: Order.StatusCode | undefined,
  deliveryMethod?: Order.DeliveryMethod | null,
) => {
  if (!code) return ''
  if (code === 'ready_to_deliver' || code === 'completed') {
    return deliveryMethod
      ? `orderStatus.buyer.${code}_${deliveryMethod}`
      : `orderStatus.buyer.${code}`
  }
  return `orderStatus.buyer.${code}`
}

const getClientIcon = (status: Order.UIStatus | undefined) =>
  status ? clientIcons[status] : undefined
const getClientLabelKey = (status: Order.UIStatus | undefined) =>
  status ? clientLabelKeys[status] : ''

const getShopIcon = (status: Order.ShopOrderStatus | undefined) =>
  status ? shopIcons[status] : undefined
const getShopLabelKey = (status: Order.ShopOrderStatus | undefined) =>
  status ? shopLabelKeys[status] : ''

type AppTheme = UnistylesThemes[keyof UnistylesThemes]

const getShopColor = (status: Order.ShopOrderStatus | undefined, theme: AppTheme) => {
  switch (status) {
    case 'pending':
      return theme.colors.warning
    case 'ready_to_take':
      return theme.colors.success
    case 'approved':
      return theme.colors.blueMain
    case 'rejected':
      return theme.colors.failure
    default:
      return theme.colors.warning
  }
}

export type StatusTone = 'warning' | 'main' | 'success' | 'error'

/** Как статус выглядит у продавца: подпись, иконка и тон (цвет). */
export type SellerStatusView = {
  labelKey: string
  Icon: SvgType
  tone: StatusTone
}

const getToneColor = (tone: StatusTone, theme: AppTheme) => {
  switch (tone) {
    case 'warning':
      return theme.colors.warning
    case 'success':
      return theme.colors.success
    case 'error':
      return theme.colors.failure
    default:
      return theme.colors.blueMain
  }
}

const globalSellerView = (order: Order.Item): SellerStatusView => {
  const code = order.order_status.code
  const tone: StatusTone =
    code === 'pending'
      ? 'warning'
      : code === 'completed'
        ? 'success'
        : code === 'rejected'
          ? 'error'
          : 'main'
  const Icon =
    code === 'pending'
      ? ClockIcon
      : code === 'rejected'
        ? CancelledIcon
        : code === 'ready_to_take' || code === 'ready_to_deliver'
          ? PackageCheckIcon
          : CheckIcon
  return {
    labelKey: getBuyerLabelKey(code, order.delivery_method),
    Icon,
    tone,
  }
}

/**
 * Что показывать продавцу крупно — на карточке в списке и в заказе.
 *
 * Раньше это был только статус части магазина. Но часть останавливается на
 * «Собран», а дальше заказ ведёт оператор: после выдачи покупателю продавец
 * всё ещё видел «Готов к выдаче» и не знал, что заказ давно завершён.
 * Поэтому:
 * - пока оператор не принял заказ и после того, как все части собраны, —
 *   общий статус заказа (он и есть правда о заказе);
 * - пока заказ принят оператором (approved) — статус своей части с
 *   подсказкой, что делать дальше: в этот момент от продавца ждут действий;
 * - свою отклонённую часть продавец видит как «Вы отклонили» на любом шаге,
 *   иначе отказ выглядел бы как «Завершён».
 * Часть FBO собирает склад Postshop — у неё «что делать» продавцу не
 * подходит, показываем общий статус.
 */
const getSellerView = (order: Order.Item, part: Order.OrderShop | undefined): SellerStatusView => {
  const code = order.order_status.code
  if (code === 'rejected') return globalSellerView(order)
  if (part?.status === 'rejected') {
    return {
      labelKey: 'orderStatus.seller.rejected',
      Icon: CancelledIcon,
      tone: 'error',
    }
  }
  if (code === 'approved' && part && part.warehouse_type !== 'fbo') {
    return {
      labelKey: `orderStatus.seller.${part.status}`,
      Icon: shopIcons[part.status],
      tone:
        part.status === 'pending'
          ? 'warning'
          : part.status === 'ready_to_take'
            ? 'success'
            : 'main',
    }
  }
  return globalSellerView(order)
}

/**
 * Ждёт ли часть продавца его действий: заказ принят оператором, часть FBS
 * ещё не принята или не собрана. То же условие, что у счётчика
 * `/orders/shop/{id}/attention-count`.
 */
const needsSellerAction = (order: Order.Item, part: Order.OrderShop | undefined) =>
  order.order_status.code === 'approved' &&
  !!part &&
  part.warehouse_type !== 'fbo' &&
  (part.status === 'pending' || part.status === 'approved')

export const orderStatus = {
  client: {
    getIcon: getClientIcon,
    getLabelKey: getClientLabelKey,
    map: clientStatusMap,
  },
  buyer: {
    getLabelKey: getBuyerLabelKey,
  },
  seller: {
    getView: getSellerView,
    getToneColor,
    needsAction: needsSellerAction,
  },
  shop: {
    getIcon: getShopIcon,
    getLabelKey: getShopLabelKey,
    getColor: getShopColor,
  },
}
