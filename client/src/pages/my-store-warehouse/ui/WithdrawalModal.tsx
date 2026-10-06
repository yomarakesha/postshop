import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ModalRef } from '#/shared/ui/Modal'
import { useCreateWithdrawalWithdrawalsPost } from '#/shared/openapi/queries'
import { useListShopWithdrawalsWithdrawalsShopShopIdGetKey } from '#/shared/openapi/queries/common'
import { getErrorMessage } from '#/shared/lib/apiError'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { Modal } from '#/shared/ui/Modal'
import { TextArea } from '#/shared/ui/TextArea'

export interface WithdrawalTarget {
  productId: number
  name: string
  /** Свободно на складе — больше забрать нельзя: остальное держат заказы. */
  available: number
}

interface Props {
  shopId: number
  target: WithdrawalTarget | null
  onDone: () => void
}

/**
 * Заявка на вывоз товара со склада Postshop.
 *
 * Забрать свой товар продавец FBO раньше не мог никак: возврат магазину
 * оформлял только сотрудник, и только если сам знал о желании продавца.
 */
export const WithdrawalModal = forwardRef<ModalRef, Props>(({ shopId, target, onDone }, ref) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    setQuantity(target ? String(target.available) : '')
    setComment('')
  }, [target?.productId])

  const close = () => (ref as React.RefObject<ModalRef>).current.close()

  const create = useCreateWithdrawalWithdrawalsPost(undefined, {
    onSuccess: () => {
      toast.success(t('withdrawal.sent'))
      void queryClient.invalidateQueries({
        queryKey: [useListShopWithdrawalsWithdrawalsShopShopIdGetKey],
      })
      close()
      onDone()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const submit = () => {
    if (!target) return
    const amount = Number(quantity)
    if (!Number.isFinite(amount) || amount <= 0 || amount > target.available) {
      toast.error(t('withdrawal.quantityInvalid', { count: target.available }))
      return
    }
    create.mutate({
      body: {
        shop_id: shopId,
        items: [{ product_id: target.productId, quantity: amount }],
        comment: comment.trim() || null,
      },
    })
  }

  return (
    <Modal ref={ref} className="w-full max-w-100">
      <div className="flex flex-col gap-3 p-6">
        <h2 className="p1 font-bold">{t('withdrawal.title')}</h2>
        {target && (
          <div className="flex flex-col gap-0.5">
            <p className="p3 text-passive2">{target.name}</p>
            <p className="t1 text-passive2">{t('withdrawal.free', { count: target.available })}</p>
          </div>
        )}
        <Input
          type="number"
          min={0}
          label={t('withdrawal.quantity')}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <TextArea
          rows={3}
          label={t('withdrawal.comment')}
          placeholder={t('withdrawal.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="t2 text-passive2">{t('withdrawal.notice')}</p>
        <div className="flex gap-2">
          <Button disabled={create.isPending} onClick={submit}>
            {t('withdrawal.send')}
          </Button>
          <Button variant="tertiary" onClick={close}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

WithdrawalModal.displayName = 'WithdrawalModal'
