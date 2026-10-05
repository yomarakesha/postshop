import { useRef } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import {
  useBlockShopBaseShopBasesShopIdBlockPatch,
  useUnblockShopBaseShopBasesShopIdUnblockPatch,
} from '#/shared/openapi/queries'
import * as Common from '#/shared/openapi/queries/common'
import { useProfileStore } from '#/shared/stores/profileStore'
import { Button } from '#/shared/ui/Button'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'

export const StoreClosePage = () => {
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const confirmRef = useRef<ConfirmDialogRef>(null)

  const shop = useProfileStore((s) => s.profile?.shops?.find((x) => x.id === Number(storeId)))
  const isClosed = Boolean(shop && !shop.is_active)
  // Закрытый платформой магазин владелец не открывает — сервер ответит 403.
  const isClosedByStaff = isClosed && Boolean(shop?.blocked_by_staff)

  // Профиль — источник признака is_active для всего кабинета (сайдбар, баннер
  // над страницами), поэтому после переключения его нужно перечитать.
  const refreshProfile = () =>
    queryClient.invalidateQueries({ queryKey: Common.UseMeAuthMeGetKeyFn() })

  const close = useBlockShopBaseShopBasesShopIdBlockPatch(undefined, {
    onSuccess: () => {
      confirmRef.current?.close()
      toast.success(t('storeClose.closed'))
      refreshProfile()
    },
    // 409 — у магазина есть незавершённые дела: открытые заказы или
    // возвраты. Общее «не удалось» не объясняло, что сделать.
    onError: (error) =>
      toast.error(
        (error as { status?: number } | undefined)?.status === 409
          ? t('storeClose.hasOpenWork')
          : t('storeClose.failed'),
      ),
  })

  const reopen = useUnblockShopBaseShopBasesShopIdUnblockPatch(undefined, {
    onSuccess: () => {
      toast.success(t('storeClose.reopened'))
      refreshProfile()
    },
    onError: () => toast.error(t('storeClose.failed')),
  })

  const isPending = close.isPending || reopen.isPending

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl shadow-base p-6">
      <div className="flex flex-col gap-2">
        <h1 className="p1 font-bold">
          {isClosed ? t('storeClose.reopenTitle') : t('storeClose.title')}
        </h1>
        <p className="p3 text-passive2">
          {isClosedByStaff
            ? t('storeClose.closedByStaff')
            : isClosed
              ? t('storeClose.reopenSubtitle')
              : t('storeClose.subtitle')}
        </p>
      </div>

      {isClosedByStaff ? null : isClosed ? (
        <Button
          disabled={isPending}
          onClick={() => reopen.mutate({ path: { shop_id: Number(storeId) } })}
          className="self-start"
        >
          {t('storeClose.reopen')}
        </Button>
      ) : (
        <Button
          variant="danger"
          disabled={isPending}
          onClick={() => confirmRef.current?.open()}
          className="self-start"
        >
          {t('storeClose.close')}
        </Button>
      )}

      {/* Раньше здесь была кнопка «Удалить», у которой не было обработчика:
          нажатие не делало ничего, а метода удаления магазина в API нет вовсе.
          Вместо неё — честное объяснение, как удалить магазин на самом деле. */}
      <div className="flex flex-col gap-1 border-t border-stroke pt-4">
        <p className="p3 font-medium">{t('storeClose.deleteTitle')}</p>
        <p className="t1 text-passive2">{t('storeClose.deleteText')}</p>
        <Link to="/contact-us" className="t1 text-blue-main font-medium">
          {t('storeClose.deleteLink')}
        </Link>
      </div>

      <ConfirmDialog
        ref={confirmRef}
        title={t('storeClose.confirmTitle')}
        text={t('storeClose.confirmText')}
        confirmLabel={t('storeClose.confirm')}
        cancelLabel={t('storeClose.cancel')}
        destructive
        busy={isPending}
        onConfirm={() => close.mutate({ path: { shop_id: Number(storeId) } })}
      />
    </div>
  )
}
