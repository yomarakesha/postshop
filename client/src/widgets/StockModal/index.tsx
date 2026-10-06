import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ModalRef } from '#/shared/ui/Modal'
import {
  useCreateStockOperationStockOperationsPost,
  useGetProductStockSummaryStockOperationsProductIdSummaryGet,
  useSetStockStockOperationsSetPost,
} from '#/shared/openapi/queries'
import { useGetProductStockSummaryStockOperationsProductIdSummaryGetKey } from '#/shared/openapi/queries/common'
import { OperationType } from '#/shared/openapi/requests'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { cn } from '#/shared/utils/cn'
import { getErrorMessage } from '#/shared/lib/apiError'

/** Пересчёт — не тип операции в форме, а свой метод: разницу считает сервер. */
export const SET = 'set' as const
export type StockMode =
  | typeof OperationType.INCOME
  | typeof OperationType.RETURN_TO_SUPPLIER
  | typeof SET

const ALL_MODES: ReadonlyArray<StockMode> = [
  OperationType.INCOME,
  OperationType.RETURN_TO_SUPPLIER,
  SET,
]

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
  /**
   * Какие действия предложить. У «Приёма товара» оно одно — приход, у
   * «Остатков» — пересчёт и возврат поставщику; карточка товара даёт все три.
   */
  modes?: ReadonlyArray<StockMode>
  /** Заголовок окна; по умолчанию «Изменить остаток». */
  title?: string
  /** Сообщение после записи прихода или возврата; по умолчанию «Движение записано». */
  savedText?: string
}

/**
 * Движение по складу магазина FBS: приход, возврат поставщику, пересчёт.
 *
 * Открывается из трёх мест: с карточки в «Моих товарах» (все три действия),
 * из «Приёма товара» (только приход) и из «Остатков» (пересчёт и возврат
 * поставщику). У магазина FBO этого окна нет: его товар приходует платформа.
 *
 * «Приход» и «Возврат поставщику» описывают то, что физически произошло с
 * товаром, а «Указать остаток» — пересчёт: продавец называет итог, разницу
 * считает сервер. Без него пересчитанную полку сводили выдуманным приходом или
 * возвратом поставщику, которого не было.
 */
export const StockModal = forwardRef<ModalRef, Props>(
  ({ shopId, target, onDone, modes = ALL_MODES, title, savedText }, ref) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [mode, setMode] = useState<StockMode>(modes[0])

    // Для пересчёта нужна полка, а не «доступно»: собранный заказ с полки уже
    // ушёл, а несобранный ещё лежит на ней. Раньше пересчёт сравнивал с
    // «доступно» и прибавлял несобранные заказы второй раз.
    const { data: summary } = useGetProductStockSummaryStockOperationsProductIdSummaryGet(
      { path: { product_id: target?.productId ?? 0 } },
      undefined,
      { enabled: target !== null && mode === SET },
    )
    const [quantity, setQuantity] = useState('')

    // Каждый товар открывается с чистой формой: остаток прошлого товара в поле
    // пересчёта — готовая ошибка.
    useEffect(() => {
      setMode(modes[0])
      setQuantity('')
    }, [target?.productId])

    const close = () => (ref as React.RefObject<ModalRef>).current.close()
    const done = (message: string) => {
      toast.success(message)
      close()
      setQuantity('')
      void queryClient.invalidateQueries({
        queryKey: [useGetProductStockSummaryStockOperationsProductIdSummaryGetKey],
      })
      onDone()
    }
    const fail = (error: unknown) => toast.error(getErrorMessage(error))

    const move = useCreateStockOperationStockOperationsPost(undefined, {
      onSuccess: () => done(savedText ?? t('stock.saved')),
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
          <h2 className="p1 font-bold">{title ?? t('stock.operationTitle')}</h2>
          {target && (
            <div className="flex flex-col gap-0.5">
              <p className="p3 text-passive2">{target.name}</p>
              {mode === SET && summary ? (
                <p className="t1 text-passive2">
                  {t('stock.breakdown', {
                    shelf: Number(summary.on_shelf),
                    reserved: Number(summary.reserved),
                    available: Number(summary.available),
                  })}
                </p>
              ) : (
                <p className="t1 text-passive2">
                  {t('stock.available', { count: target.available })}
                </p>
              )}
            </div>
          )}

          {/* Одно действие — выбирать не из чего, карточка выбора была бы шумом. */}
          {modes.length > 1 &&
            modes.map((value) => (
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
  },
)

StockModal.displayName = 'StockModal'
