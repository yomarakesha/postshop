import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { NotificationResponse } from '#/shared/openapi/requests'
import { NotificationKind } from '#/shared/openapi/requests'
import { cn } from '#/shared/utils/cn'

/**
 * Виды, где comment — это код статуса заказа, а не текст человека. Его надо
 * переводить, а не показывать как есть: в базе лежит «ready_to_deliver».
 */
const STATUS_KINDS = new Set<string>([NotificationKind.ORDER_STATUS])

interface Props {
  notification: NotificationResponse
  /** Куда ведёт уведомление; `null` — вести некуда. */
  href: string | null
  onRead: () => void
  /** Убрать уведомление совсем. Не передан — крестика не будет. */
  onDismiss?: () => void
  className?: string
}

/**
 * Одно уведомление — общий вид для колокольчика и для страницы со всеми.
 *
 * Раньше разметка жила прямо в колокольчике, и второе место показа означало бы
 * её копию: два списка, расходящиеся при первой же правке.
 */
export const NotificationRow = ({ notification, href, onRead, onDismiss, className }: Props) => {
  const { t, i18n } = useTranslation()
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  // Код статуса заказа переводим, текст модератора показываем как есть.
  const detail = notification.comment
    ? STATUS_KINDS.has(notification.kind)
      ? t(`orders.status.${notification.comment}`)
      : notification.comment
    : null

  const body = (
    <>
      <p className="t1 font-medium">{t(`notifications.kind.${notification.kind}`)}</p>
      {detail && <p className="t2 text-passive2">{detail}</p>}
      {notification.created_at && (
        <p className="t2 text-passive1">{dateFormat.format(new Date(notification.created_at))}</p>
      )}
    </>
  )

  const inner = 'flex flex-1 flex-col gap-0.5 py-3 pl-4 text-left'

  // Без адреса уведомление остаётся кнопкой: нажатие только отмечает
  // прочитанным — так вело себя каждое из них. Со ссылкой оно наконец ведёт
  // туда, о чём говорит.
  const main = href ? (
    <Link to={href} onClick={onRead} className={inner}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onRead} className={inner}>
      {body}
    </button>
  )

  return (
    // Крестик — сосед основной области, а не её содержимое: кнопка внутри
    // ссылки недопустима, браузер разбирает такую вложенность по-своему, и
    // нажатие достаётся то одному, то другому.
    <div
      className={cn(
        'flex w-full items-start transition-colors',
        notification.is_read ? 'bg-white hover:bg-gray2' : 'bg-blue1 hover:bg-blue2/60',
        className,
      )}
    >
      {main}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('notifications.dismiss')}
          title={t('notifications.dismiss')}
          className="shrink-0 self-center p-3 text-passive1 transition-colors hover:text-failure"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
