import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { cn } from '#/shared/utils/cn'
import PendingIcon from '#/shared/assets/icons/order-statuses/pending.svg?react'

type OrderStatus = 'done' | 'cancelled' | 'pending' | 'in_progress' | 'attention'

interface OrderProduct {
  /** Номер строки заказа: он уникален и служит ключом списка. */
  id: number
  /**
   * Номер самого товара.
   *
   * Отдельное поле, потому что `id` — это строка заказа, а не товар. Действие
   * над товаром (оценить) требует именно товара, и раньше туда уходил номер
   * строки: сервер отвечал «этот товар вы не покупали».
   */
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  warning?: string
}

export const ProductItem = ({
  product,
  status,
  action,
}: {
  product: OrderProduct
  status: OrderStatus
  /** Действие над купленным товаром — сейчас это «оценить». */
  action?: ReactNode
}) => {
  const { t } = useTranslation()
  const hasWarning = status === 'attention' && product.warning

  return (
    <div
      className={cn(
        'flex gap-4 items-center py-4',
        hasWarning && 'border border-failure rounded-base p-3 my-2',
      )}
    >
      <img
        src={product.image}
        alt={product.name}
        className="size-16 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-col gap-1 flex-1">
        <p className="p3 font-medium">{product.name}</p>
        <p className="t1 text-passive2">
          {product.price.toFixed(2)} {t('dashboard.revenue.currency')} · {product.quantity}{' '}
          {t('orders.detail.pieces')}
        </p>
        {hasWarning && (
          <div className="flex items-start gap-1.5 mt-1">
            <PendingIcon width={16} height={16} className="text-failure shrink-0 mt-0.5" />
            <p className="t1 text-failure">{product.warning}</p>
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
