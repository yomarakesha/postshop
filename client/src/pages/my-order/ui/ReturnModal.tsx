import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { TextArea } from '#/shared/ui/TextArea'
import { useCreateReturnReturnsPost } from '#/shared/openapi/queries'
import { useListOwnReturnsReturnsMyGetKey } from '#/shared/openapi/queries/common'
import { settled } from '#/shared/lib/settled'
import { getErrorMessage } from '#/shared/lib/apiError'

export interface ReturnModalRef {
  /** Возврат заводится на строку заказа, а не на товар: возвращают покупку. */
  open: (orderItemId: number, productName: string, purchased: number, price: number) => void
}

/**
 * Заявка на возврат купленного товара.
 *
 * Возврата на витрине не было вовсе: товар физически возвращали, а в системе он
 * оставался проданным. Заявка подаётся из заказа — только там видно, что именно
 * и сколько было куплено.
 */
export const ReturnModal = forwardRef<ReturnModalRef>((_, ref) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const modalRef = useRef<ModalRef>(null)

  const [target, setTarget] = useState<{
    id: number
    name: string
    purchased: number
    price: number
  } | null>(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  useImperativeHandle(ref, () => ({
    open: (orderItemId, productName, purchased, price) => {
      setTarget({ id: orderItemId, name: productName, purchased, price })
      // Чаще всего возвращают всю покупку — подставляем её целиком.
      setQuantity(String(purchased))
      setReason('')
      modalRef.current?.open()
    },
  }))

  const createReturn = useCreateReturnReturnsPost(undefined, {
    onSuccess: () => {
      toast.success(t('returns.sent'))
      modalRef.current?.close()
      void queryClient.invalidateQueries({ queryKey: [useListOwnReturnsReturnsMyGetKey] })
    },
    onError: (error) => {
      // 400 у этого метода всегда про количество или про уже идущую заявку —
      // общий текст «неверный запрос» тут ничего не объясняет.
      const status = (error as { status?: number } | undefined)?.status
      const detail = (error as { detail?: string } | undefined)?.detail
      if (status === 400) {
        toast.error(detail ?? t('returns.notAllowed'))
        return
      }
      toast.error(getErrorMessage(error))
    },
  })

  const submit = async () => {
    if (!target) return
    const amount = Number(quantity)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('returns.quantityRequired'))
      return
    }
    if (amount > target.purchased) {
      // Ловим здесь же: сервер откажет, но узнавать предел отказом — плохо.
      toast.error(t('returns.tooMany', { count: target.purchased }))
      return
    }
    if (!reason.trim()) {
      toast.error(t('returns.reasonRequired'))
      return
    }

    await settled(
      createReturn.mutateAsync({
        body: { order_item_id: target.id, quantity: amount, reason: reason.trim() },
      }),
    )
  }

  return (
    <Modal ref={modalRef} className="w-full max-w-110 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="p2 font-bold">{t('returns.createTitle')}</h2>
          {target && (
            <p className="t1 mt-1 text-passive2">
              {target.name} · {t('returns.purchased', { count: target.purchased })}
            </p>
          )}
        </div>

        <Input
          type="number"
          min="0"
          step="0.001"
          label={t('returns.quantity')}
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <TextArea
          rows={3}
          label={t('returns.reason')}
          required
          placeholder={t('returns.reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {/* Сумма к возврату — по цене покупки, как её посчитает сервер. */}
        {target && Number(quantity) > 0 && (
          <p className="p3 font-medium">
            {t('returns.amount', {
              amount: (target.price * Number(quantity)).toFixed(2),
            })}
          </p>
        )}
        <p className="t2 text-passive2">{t('returns.notice')}</p>

        <div className="flex gap-3">
          <Button disabled={createReturn.isPending} onClick={submit}>
            {createReturn.isPending ? t('returns.sending') : t('returns.send')}
          </Button>
          <Button variant="tertiary" onClick={() => modalRef.current?.close()}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

ReturnModal.displayName = 'ReturnModal'
