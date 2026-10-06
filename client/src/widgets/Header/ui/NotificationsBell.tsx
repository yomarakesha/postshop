import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import {
  useDeleteNotificationNotificationsNotificationIdDelete,
  useListNotificationsNotificationsGet,
  useMarkAllReadNotificationsReadAllPatch,
  useMarkReadNotificationsNotificationIdReadPatch,
  useMeAuthMeGetKey,
  useUnreadCountNotificationsUnreadCountGet,
} from '#/shared/openapi/queries'
import {
  useListNotificationsNotificationsGetKey,
  useUnreadCountNotificationsUnreadCountGetKey,
} from '#/shared/openapi/queries/common'
import { useProfileStore } from '#/shared/stores/profileStore'
import { notificationTarget } from '#/shared/lib/notificationTarget'
import { cn } from '#/shared/utils/cn'
import { EmptyState } from '#/shared/ui/EmptyState'
import { NotificationRow } from '#/shared/ui/NotificationRow'

/**
 * Как часто перечитывать счётчик: событие приходит извне, само оно не всплывёт.
 * Раз в минуту было слишком редко — уведомление уже лежало, а числа на
 * колокольчике не было, и казалось, что его нет вовсе.
 */
const REFETCH_MS = 20_000

interface Props {
  className?: string
}

/**
 * Колокольчик с уведомлениями.
 *
 * До этого пользователь узнавал о решениях платформы, только зайдя и проверив
 * вручную: товар отклонили, заявку на магазин отклонили, статус заказа
 * сменился — нигде ни следа. Причина отказа существовала в базе и до человека
 * не доходила.
 *
 * Текст собирается здесь, а не приходит с сервера: витрина работает на четырёх
 * языках, и текст из базы был бы всегда на одном из них.
 */
export const NotificationsBell = ({ className }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const profile = useProfileStore((s) => s.profile)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: unread } = useUnreadCountNotificationsUnreadCountGet({}, undefined, {
    enabled: Boolean(profile),
    refetchInterval: REFETCH_MS,
    // Во всём приложении перечитывание при возврате на вкладку выключено;
    // счётчику оно нужно — человек возвращается проверить, что нового.
    refetchOnWindowFocus: true,
  })

  // Новое уведомление часто значит, что изменился сам профиль: магазин
  // одобрили, отклонили или закрыли. Профиль грузится один раз при входе, и
  // одобренный магазин оставался «на проверке» — в шапке не было входа в
  // кабинет, и продавец не попадал на заполнение витрины.
  const unreadCount = unread?.count ?? 0
  const previousCount = useRef(unreadCount)
  useEffect(() => {
    if (unreadCount > previousCount.current) {
      void queryClient.invalidateQueries({ queryKey: [useMeAuthMeGetKey] })
    }
    previousCount.current = unreadCount
  }, [unreadCount, queryClient])
  const { data: notifications } = useListNotificationsNotificationsGet(
    { query: { limit: 20 } },
    undefined,
    { enabled: Boolean(profile) && open },
  )

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: [useUnreadCountNotificationsUnreadCountGetKey],
    })
    void queryClient.invalidateQueries({
      queryKey: [useListNotificationsNotificationsGetKey],
    })
  }

  const markRead = useMarkReadNotificationsNotificationIdReadPatch(undefined, {
    onSuccess: refresh,
  })
  const markAllRead = useMarkAllReadNotificationsReadAllPatch(undefined, { onSuccess: refresh })
  const dismiss = useDeleteNotificationNotificationsNotificationIdDelete(undefined, {
    onSuccess: refresh,
  })

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!profile) return null

  const count = unread?.count ?? 0

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('notifications.title')}
        title={t('notifications.title')}
        /* Подпись убрана вместе с остальными в шапке. Под колокольчиком к тому
           же стояло «Ещё» — слово из другого смысла, оно попало сюда потому,
           что подпись пришлось чем-то заполнить. */
        className="flex size-11 items-center justify-center rounded-lg text-passive2 transition-colors hover:bg-gray2 hover:text-blue-main"
      >
        <span className="relative">
          <Bell size={26} />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-failure px-1 text-center text-[10px] leading-4 font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 flex max-h-100 w-90 flex-col overflow-hidden rounded-xl border border-stroke bg-white shadow-base">
          <div className="flex items-center justify-between gap-2 border-b border-stroke px-4 py-3">
            <p className="p3 font-semibold">{t('notifications.title')}</p>
            {count > 0 && (
              <button
                type="button"
                className="t2 font-medium text-blue-main"
                disabled={markAllRead.isPending}
                onClick={() => markAllRead.mutate({})}
              >
                {t('notifications.markAll')}
              </button>
            )}
          </div>

          <div className="flex flex-col overflow-y-auto">
            {(notifications ?? []).length === 0 && (
              <EmptyState variant="plain" className="py-8" title={t('notifications.empty')} />
            )}
            {(notifications ?? []).map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                href={notificationTarget(
                  notification.kind,
                  notification.entity_id,
                  profile.shops,
                  notification.shop_base_id,
                )}
                onRead={() => {
                  // Панель закрываем всегда: если уведомление ведёт по ссылке,
                  // открытый список остался бы висеть поверх новой страницы.
                  setOpen(false)
                  if (!notification.is_read) {
                    markRead.mutate({ path: { notification_id: notification.id } })
                  }
                }}
                onDismiss={() => dismiss.mutate({ path: { notification_id: notification.id } })}
                className="border-b border-stroke last:border-b-0"
              />
            ))}
          </div>

          {/* Список обрывался на двадцатом уведомлении, и двадцать первое
              было недостижимо: страницы со всеми не существовало. */}
          <Link
            to="/profile/notifications"
            onClick={() => setOpen(false)}
            className="t2 border-t border-stroke px-4 py-3 text-center font-medium text-blue-main transition-colors hover:bg-gray2"
          >
            {t('notifications.seeAll')}
          </Link>
        </div>
      )}
    </div>
  )
}
