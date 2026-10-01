import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Textarea } from '@/shared/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  busy?: boolean
  /** Причина уходит продавцу; пустая строка — отказ без причины. */
  onConfirm: (comment: string) => void
}

/**
 * Подтверждение отклонения товара с причиной — общее для очереди модерации и
 * карточки товара.
 *
 * В карточке подтверждения не было вовсе (отклоняла одним кликом), а в очереди
 * диалог обещал «Продавец увидит указанную причину», не давая её ввести.
 */
export function DeclineProductDialog({ open, onOpenChange, busy, onConfirm }: Props) {
  const { t } = useTranslation()
  const [comment, setComment] = useState('')

  // Причина от прошлого товара не должна подставиться следующему.
  const handleOpenChange = (next: boolean) => {
    if (!next) setComment('')
    onOpenChange(next)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('confirm.declineProductTitle')}
      description={
        <div className="space-y-2">
          <p>{t('confirm.declineProductText')}</p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('moderation.declineReasonPlaceholder')}
            rows={3}
          />
        </div>
      }
      confirmLabel={t('moderation.decline')}
      destructive
      busy={busy}
      onConfirm={() => onConfirm(comment.trim())}
    />
  )
}
