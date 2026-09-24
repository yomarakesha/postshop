import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '#/shared/utils/cn'
import DoneIcon from '#/shared/assets/icons/order-statuses/done.svg?react'
import CancelledIcon from '#/shared/assets/icons/order-statuses/cancelled.svg?react'
import InProgressIcon from '#/shared/assets/icons/order-statuses/in-progress.svg?react'
import PendingIcon from '#/shared/assets/icons/order-statuses/pending.svg?react'

interface Props {
  id: number
  price: number
  date: string
  status?: 'done' | 'cancelled' | 'pending' | 'in_progress' | 'attention'
  icon?: ReactNode
  label?: string
  colorClass?: string
  isActive?: boolean
  onClick?: () => void
}

export const OrderCard = ({
  price,
  status,
  icon,
  label,
  colorClass,
  id,
  date,
  isActive,
  onClick,
}: Props) => {
  const { t } = useTranslation()

  const resolvedIcon = icon ?? (status ? statusIcon[status] : null)
  const resolvedLabel = label ?? (status ? t(`orders.status.${status}`) : '')
  const resolvedColorClass = colorClass ?? (status ? statusColor[status] : '')

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-base flex flex-col gap-3 bg-white border-2 transition-colors w-full',
        // Карточка кликабельна, но никак на курсор не отзывалась — под мышью
        // ничего не менялось, и список читался как набор подписей, а не как
        // выбор. Рамка уже занимает место (border-2), поэтому подсветка на
        // наведении ничего не сдвигает. У выбранной карточки рамка своя.
        isActive ? 'border-blue-main' : 'border-transparent hover:border-stroke hover:bg-gray1',
      )}
    >
      <div className="flex justify-between items-center">
        <p className="p3 font-medium">{t('orders.orderNumber', { id })}</p>
        <p className="p3 font-semibold">
          {/* Сумма складывается из цен позиций, поэтому в ней накапливается
              погрешность double: без округления в списке появляется
              «2792.3199999999997 TMT». */}
          {price.toFixed(2)} {t('dashboard.revenue.currency')}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-passive2 t1 font-medium">{date}</p>
        <div className="flex items-center gap-3">
          <div className={cn('flex gap-2 items-center', resolvedColorClass)}>
            {resolvedIcon}
            <p className="p3 font-semibold">{resolvedLabel}</p>
          </div>
          <ChevronRight size={16} className="text-passive2 lg:hidden" />
        </div>
      </div>
    </button>
  )
}

const statusColor = {
  done: 'text-success',
  cancelled: 'text-failure',
  pending: 'text-warning',
  in_progress: 'text-blue-main',
  attention: 'text-purple-500',
}

const statusIcon = {
  done: <DoneIcon />,
  cancelled: <CancelledIcon />,
  pending: <PendingIcon />,
  in_progress: <InProgressIcon />,
  attention: <PendingIcon />,
}
