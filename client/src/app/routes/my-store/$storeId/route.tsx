import { useEffect } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { requireNumericParams } from '#/shared/lib/requireNumericParams'
import { StoreSidebar } from '#/widgets/StoreSidebar'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RegistrationStatus } from '#/shared/openapi/requests'

export const Route = createFileRoute('/my-store/$storeId')({
  component: MyStoreLayout,
  beforeLoad: ({ params }) => requireNumericParams(params, ['storeId']),
})

function MyStoreLayout() {
  const { storeId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const isProfileLoading = useProfileStore((s) => s.isProfileLoading)
  const openLoginModal = useProfileStore((s) => s.openLoginModal)

  const shop = profile?.shops?.find((s) => s.id === Number(storeId))

  // Раньше проверялась только заполненность магазина: при чужом storeId
  // выражение `shop && !shop.name` давало undefined, условие не срабатывало,
  // и кабинет чужого магазина спокойно рисовался вместе со списком заказов.
  const isOwner = Boolean(shop)
  const isIncomplete = Boolean(shop && (!shop.name || !shop.logo_path))
  const isClosed = Boolean(shop && !shop.is_active)
  const isPending = shop?.registration_status === RegistrationStatus.PENDING
  const isRejected = shop?.registration_status === RegistrationStatus.REJECTED
  const isSuspended = shop?.registration_status === RegistrationStatus.SUSPENDED

  useEffect(() => {
    if (isProfileLoading) return

    if (!profile) {
      openLoginModal()
      navigate({ to: '/', replace: true })
      return
    }

    // Проверка на стороне браузера не заменяет серверную (она есть в
    // app/core/ownership.py), а избавляет от пустых экранов и ошибок 403.
    if (!isOwner) {
      toast.error(t('myStore.notYours'))
      navigate({ to: '/profile', replace: true })
      return
    }

    if (isIncomplete) {
      navigate({
        to: '/store-activate',
        search: { storeId: Number(storeId) },
        replace: true,
      })
    }
  }, [isProfileLoading, profile, isOwner, isIncomplete, storeId, navigate, openLoginModal, t])

  if (isProfileLoading || !isOwner || isIncomplete) return null

  // Закрытый или непроверенный магазин выглядел рабочим: продавец правил
  // товары, не понимая, почему их не видно на витрине.
  const notice = isRejected
    ? t('myStore.notice.rejected')
    : isSuspended
      ? t('myStore.notice.suspended')
      : isClosed
        ? t('myStore.notice.closed')
        : isPending
          ? t('myStore.notice.pending')
          : null

  // Причина отказа: раньше поля для неё не было вовсе, и после отклонения
  // заявки владелец оставался в тишине.
  const reason = shop?.registration_comment

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <div className="rounded-base border border-warning bg-warning/10 px-4 py-3">
          <p className="t1 text-text">{notice}</p>
          {reason && <p className="t1 text-text mt-1 font-medium">{reason}</p>}
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">
        <StoreSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
