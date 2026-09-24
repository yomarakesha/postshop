import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ModalRef } from '#/shared/ui/Modal'
import {
  useCreateStockOperationStockOperationsPost,
  useSetStockStockOperationsSetPost,
} from '#/shared/openapi/queries'
import { OperationType } from '#/shared/openapi/requests'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { cn } from '#/shared/utils/cn'
import { getErrorMessage } from '#/shared/lib/apiError'

/** Пересчёт — не тип операции в форме, а свой метод: разницу считает сервер. */
const SET = 'set' as const
type Mode = typeof OperationType.INCOME | typeof OperationType.RETURN_TO_SUPPLIER | typeof SET

const MODES: ReadonlyArray<Mode> = [OperationType.INCOME, OperationType.RETURN_TO_SUPPLIER, SET]

export interface StockTarget {
  productId: number
  measureUnitId: number
  name: string
  /** Сколько доступно сейчас — подставляем в поле пересчёта. */
  available: number
}

interface Props {
  shopId: number
  target: StockTarget | null
  onDone: () => void
}

/**
 * Движение по складу прямо из списка товаров.
 *
 * Раньше жило на отдельной странице «Остатки», и получалось два списка одних и
 * тех же товаров: в одном товар правят и снимают с продажи, в другом — меняют
 * остаток. Теперь всё на карточке.
 *
 * Три действия вместо двух. «Приход» и «Возврат поставщику» описывают то, что
 * физически произошло с товаром, а «Указать остаток» — пересчёт: продавец
 * называет итог, разницу считает сервер. Без него пересчитанную полку сводили
 * выдуманным приходом или возвратом поставщику, которого не было.
 */
export const StockModal = forwardRef<ModalRef, Props>(({ shopId, target, onDone }, ref) => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>(OperationType.INCOME)
  const [quantity, setQuantity] = useState('')

  // Каждый товар открывается с чистой формой: остаток прошлого товара в поле
  // пересчёта — готовая ошибка.
  useEffect(() => {
    setMode(OperationType.INCOME)
    setQuantity('')
  }, [target?.productId])

  const close = () => (ref as React.RefObject<ModalRef>).current.close()
  const done = (message: string) => {
    toast.success(message)
    close()
    setQuantity('')
    onDone()
  }
  const fail = (error: unknown) => toast.error(getErrorMessage(error))

  const move = useCreateStockOperationStockOperationsPost(undefined, {
    onSuccess: () => done(t('stock.saved')),
    onError: fail,
  })
  const set = useSetStockStockOperationsSetPost(undefined, {
    onSuccess: () => done(t('stock.setSaved')),
    onError: fail,
  })
  const busy = move.isPending || set.isPending

  const submit = () => {
    if (!target) return
    const amount = Number(quantity)
    // Пересчёт принимает ноль: «не осталось ничего» — обычный его исход.
    const valid = Number.isFinite(amount) && (mode === SET ? amount >= 0 : amount > 0)
    if (!valid) {
      toast.error(t(mode === SET ? 'stock.amountRequired' : 'stock.quantityRequired'))
      return
    }
    const body = {
      shop_id: shopId,
      product_id: target.productId,
      measure_unit_id: target.measureUnitId,
      quantity: amount,
    }
    if (mode === SET) set.mutate({ body })
    else move.mutate({ body: { ...body, operation_type: mode } })
  }

  return (
    <Modal ref={ref} className="w-full max-w-100">
      <div className="flex flex-col gap-3 p-6">
        <h2 className="p1 font-bold">{t('stock.operationTitle')}</h2>
        {target && (
          <div className="flex flex-col gap-0.5">
            <p className="p3 text-passive2">{target.name}</p>
            <p className="t1 text-passive2">{t('stock.available', { count: target.available })}</p>
          </div>
        )}

        {MODES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              'rounded-base border p-3 text-left transition-colors',
              mode === value ? 'border-blue-main bg-blue1' : 'border-stroke hover:bg-gray2',
            )}
          >
            <p className="p3 font-medium">{t(`stock.operations.${value}`)}</p>
            <p className="t1 text-passive2">{t(`stock.operationsHint.${value}`)}</p>
          </button>
        ))}

        <Input
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={t(mode === SET ? 'stock.amountPlaceholder' : 'stock.quantityPlaceholder')}
        />

        <div className="flex gap-2">
          <Button disabled={busy} onClick={submit}>
            {t('stock.save')}
          </Button>
          <Button variant="tertiary" onClick={close}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

StockModal.displayName = 'StockModal'
