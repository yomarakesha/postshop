import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useShopBaseQuery } from '../model/useShopBaseQuery'
import { useUpdateRegistrationStatusMutation } from '../model/useUpdateRegistrationStatusMutation'
import { formatDate } from '@/shared/lib/formatDate'
import { getUserUsersUserIdGet, RegistrationStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { ShopDocuments } from '@/widgets/ShopDocuments'

const statusVariant = {
  [RegistrationStatus.PENDING]: 'warning',
  [RegistrationStatus.APPROVED]: 'success',
  [RegistrationStatus.REJECTED]: 'destructive',
  [RegistrationStatus.SUSPENDED]: 'default',
} as const

export function BecomeStoreRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const shopId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading } = useShopBaseQuery(shopId)
  const updateStatus = useUpdateRegistrationStatusMutation(shopId)
  // Хук объявлен здесь, а не ниже: после условных возвратов порядок хуков
  // менялся бы между отрисовками.
  const [askReject, setAskReject] = useState(false)
  const [rejectComment, setRejectComment] = useState('')

  const shop = data?.data
  const ownerId = shop?.owner_id

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['users', ownerId],
    queryFn: () =>
      getUserUsersUserIdGet({
        path: { user_id: ownerId! },
        throwOnError: true,
      }),
    enabled: ownerId != null,
  })

  if (isLoading || (shop && userLoading)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop) return null

  const user = userData?.data
  const isPending = shop.registration_status === RegistrationStatus.PENDING

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => navigate('/become-store-requests')}>
          <ArrowLeft className="size-4" />
          {t('back')}
        </Button>

        {isPending && (
          <div className="flex items-center gap-2">
            {/* Отклонение необратимо из этого интерфейса и делалось одним
                кликом без вопроса. */}
            <Button
              type="button"
              variant="destructive"
              onClick={() => setAskReject(true)}
              isLoading={updateStatus.isPending}
            >
              <X className="size-4" />
              {t('becomeStoreRequests.reject')}
            </Button>
            <Button
              type="button"
              onClick={() => updateStatus.mutate({ status: RegistrationStatus.APPROVED })}
              isLoading={updateStatus.isPending}
            >
              <Check className="size-4" />
              {t('becomeStoreRequests.accept')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <div className="space-y-1.5">
          <Label>{t('fields.fullName')}</Label>
          <p className="text-sm font-medium">
            {user?.name ?? '—'} {user?.surname ?? '—'}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.phone')}</Label>
          <p className="text-sm">{user?.phone ?? '—'}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('becomeStoreRequests.legalEntityType')}</Label>
          <p className="text-sm">{t(shop.legal_entity_type)}</p>
        </div>

        <div className="space-y-1.5">
          <Label>{t('becomeStoreRequests.registrationStatus')}</Label>
          <div>
            <Badge variant={statusVariant[shop.registration_status]}>
              {t(`registrationStatus.${shop.registration_status}`)}
            </Badge>
          </div>
        </div>

        {/* Причина отказа: раньше её негде было ни записать, ни прочитать. */}
        {shop.registration_comment && (
          <div className="space-y-1.5">
            <Label>{t('becomeStoreRequests.rejectReason')}</Label>
            <p className="text-sm whitespace-pre-line">{shop.registration_comment}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t('fields.createdAt')}</Label>
          <p className="text-sm tabular-nums">{formatDate(shop.created_at)}</p>
        </div>
      </div>

      <ShopDocuments
        shopId={shopId}
        legalEntityType={shop.legal_entity_type}
        documents={shop.documents}
      />
      <ConfirmDialog
        open={askReject}
        onOpenChange={setAskReject}
        title={t('confirm.declineShopTitle')}
        description={
          <div className="space-y-2">
            <p>{t('confirm.declineShopText')}</p>
            {/* Поля для причины у заявки не было вовсе: заявку отклоняли, а
                владелец не узнавал, что исправить. */}
            <Textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder={t('becomeStoreRequests.rejectReasonPlaceholder')}
              rows={3}
            />
          </div>
        }
        confirmLabel={t('becomeStoreRequests.reject')}
        destructive
        busy={updateStatus.isPending || rejectComment.trim().length === 0}
        onConfirm={() =>
          updateStatus.mutate({
            status: RegistrationStatus.REJECTED,
            comment: rejectComment.trim(),
          })
        }
      />
    </div>
  )
}
