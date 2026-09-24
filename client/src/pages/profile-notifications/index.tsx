import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BellOff } from 'lucide-react'
import {
  useDeleteNotificationNotificationsNotificationIdDelete,
  useListNotificationsNotificationsGet,
  useMarkAllReadNotificationsReadAllPatch,
  useMarkReadNotificationsNotificationIdReadPatch,
  useUnreadCountNotificationsUnreadCountGet,
} from '#/shared/openapi/queries'
import {
  useListNotificationsNotificationsGetKey,
  useUnreadCountNotificationsUnreadCountGetKey,
} from '#/shared/openapi/queries/common'
import { useProfileStore } from '#/shared/stores/profileStore'
import { notificationTarget } from '#/shared/lib/notificationTarget'
import { Button } from '#/shared/ui/Button'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { NotificationRow } from '#/shared/ui/NotificationRow'

/** По столько уведомлений добавляется за одно нажатие «показать ещё». */
const PAGE_SIZE = 20

/**
 * Все уведомления.
 *
 * В колокольчике их помещалось двадцать, и двадцать первое было недостижимо:
 * ни постраничной загрузки, ни отдельной страницы не было, хотя метод и тогда
 * принимал skip/limit. История уведомлений просто обрывалась.
 */
export const ProfileNotificationsPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const profile = useProfileStore((s) => s.profile)

  // Растущий предел вместо страниц: список читается сверху вниз, и разбивать
  // его на пронумерованные страницы значило бы терять уже прочитанное место.
  const [limit, setLimit] = useState(PAGE_SIZE)

  const { data: notifications, isLoading } = useListNotificationsNotificationsGet(
    { query: { limit } },
    undefined,
    { enabled: Boolean(profile) },
  )
  const { data: unread } = useUnreadCountNotificationsUnreadCountGet({}, undefined, {
    enabled: Boolean(profile),
  })

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

  const items = notifications ?? []
  const count = unread?.count ?? 0
  // Ровно столько, сколько просили, — значит, скорее всего, есть и дальше.
  // Общее число приходит заголовком x-total-count, но типизированный хук
  // отдаёт только тело ответа.
  const mayHaveMore = items.length >= limit

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-base bg-white p-4 shadow-base">
        <h1 className="p1 font-bold">{t('notifications.title')}</h1>
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

      {isLoading && <ListSkeleton rows={4} rowClassName="h-20" />}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={<BellOff size={40} strokeWidth={1.5} />}
          title={t('notifications.empty')}
        />
      )}

      {items.length > 0 && (
        <ul className="flex flex-col overflow-hidden rounded-base bg-white shadow-base">
          {items.map((notification) => (
            <li key={notification.id} className="border-b border-stroke last:border-b-0">
              <NotificationRow
                notification={notification}
                href={notificationTarget(
                  notification.kind,
                  notification.entity_id,
                  profile?.shops,
                  notification.shop_base_id,
                )}
                onRead={() => {
                  if (!notification.is_read) {
                    markRead.mutate({ path: { notification_id: notification.id } })
                  }
                }}
                onDismiss={() => dismiss.mutate({ path: { notification_id: notification.id } })}
              />
            </li>
          ))}
        </ul>
      )}

      {mayHaveMore && (
        <Button
          variant="tertiary"
          className="self-center"
          onClick={() => setLimit((value) => value + PAGE_SIZE)}
        >
          {t('notifications.loadMore')}
        </Button>
      )}
    </div>
  )
}
