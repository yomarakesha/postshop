import { PackageCheck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ModalRef } from '#/shared/ui/Modal'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import {
  useAddItemStockReceiptsReceiptIdItemsPost,
  useCancelReceiptStockReceiptsReceiptIdCancelPost,
  useCreateReceiptStockReceiptsPost,
  useDeleteItemStockReceiptsReceiptIdItemsItemIdDelete,
  useGetMyProductsProductsMyGet,
  useGetWarehousesWarehousesGet,
  useListReceiptsStockReceiptsGet,
} from '#/shared/openapi/queries'
import { useListReceiptsStockReceiptsGetKey } from '#/shared/openapi/queries/common'
import { ReceiptStatus, WarehouseType } from '#/shared/openapi/requests'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { REFERENCE_LIST_LIMIT } from '#/shared/constants/pagination'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { Select } from '#/shared/ui/Select'
import { Modal } from '#/shared/ui/Modal'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { EmptyState } from '#/shared/ui/EmptyState'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { cn } from '#/shared/utils/cn'

/**
 * Приходы товара на склад.
 *
 * Методы существовали, а экрана у продавца не было ни одного: приход умела
 * только админка. Продавец не мог ни отправить товар на склад оператора, ни
 * увидеть, что с уже отправленным.
 *
 * Подтверждает приход платформа (право stock_receipts:confirm продавцу не
 * выдаётся) — об этом сказано прямо, чтобы черновик не выглядел зависшим.
 */
export const StoreReceiptsPage = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const numericStoreId = Number(storeId)
  const queryClient = useQueryClient()

  const createModalRef = useRef<ModalRef>(null)
  const itemModalRef = useRef<ModalRef>(null)
  const cancelDialogRef = useRef<ConfirmDialogRef>(null)

  const { data: additional } = useShopAdditional(numericStoreId)
  // Приёмка — раздел магазина FBO: его товар хранит платформа. Раньше здесь
  // стояла проверка на FBS, и страница открывалась не тому типу.
  const isTracked = additional?.warehouse_type === WarehouseType.FBO

  const { data: receipts, isLoading } = useListReceiptsStockReceiptsGet(
    { query: { limit: REFERENCE_LIST_LIMIT } },
    undefined,
    { enabled: isTracked },
  )
  const ownReceipts = useMemo(
    () => (receipts ?? []).filter((receipt) => receipt.shop_id === numericStoreId),
    [receipts, numericStoreId],
  )

  const { data: warehouses } = useGetWarehousesWarehousesGet(
    { query: { limit: REFERENCE_LIST_LIMIT, is_active: true } },
    undefined,
    { enabled: isTracked },
  )
  const { data: products } = useGetMyProductsProductsMyGet(
    { query: { shop_base_id: numericStoreId, limit: REFERENCE_LIST_LIMIT } },
    undefined,
    { enabled: isTracked },
  )

  const [warehouseId, setWarehouseId] = useState('')
  const [activeReceiptId, setActiveReceiptId] = useState<number | null>(null)
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [useListReceiptsStockReceiptsGetKey] })

  const createReceipt = useCreateReceiptStockReceiptsPost(undefined, {
    onSuccess: () => {
      toast.success(t('receipts.created'))
      createModalRef.current?.close()
      setWarehouseId('')
      void refresh()
    },
  })
  const addItem = useAddItemStockReceiptsReceiptIdItemsPost(undefined, {
    onSuccess: () => {
      toast.success(t('receipts.itemAdded'))
      itemModalRef.current?.close()
      setProductId('')
      setQuantity('')
      void refresh()
    },
  })
  const deleteItem = useDeleteItemStockReceiptsReceiptIdItemsItemIdDelete(undefined, {
    onSuccess: () => void refresh(),
  })
  const cancelReceipt = useCancelReceiptStockReceiptsReceiptIdCancelPost(undefined, {
    onSuccess: () => {
      toast.success(t('receipts.cancelled'))
      void refresh()
    },
  })

  const openItemModal = (receiptId: number) => {
    setActiveReceiptId(receiptId)
    setProductId('')
    setQuantity('')
    itemModalRef.current?.open()
  }

  const submitItem = () => {
    const product = products?.find((candidate) => String(candidate.id) === productId)
    const amount = Number(quantity)
    if (!product) {
      toast.error(t('receipts.productRequired'))
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('stock.quantityRequired'))
      return
    }
    if (activeReceiptId === null) return
    addItem.mutate({
      path: { receipt_id: activeReceiptId },
      body: {
        product_id: product.id,
        measure_unit_id: product.measure_unit_id,
        quantity: amount,
      },
    })
  }

  if (!isTracked) {
    return (
      <div className="w-full rounded-base bg-white p-6 shadow-base">
        <h1 className="p1 font-bold">{t('receipts.title')}</h1>
        <p className="p3 mt-2 text-passive2">{t('receipts.notTracked')}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-base bg-white p-4 shadow-base">
        <div>
          <h1 className="p1 font-bold">{t('receipts.title')}</h1>
          <p className="t1 mt-1 text-passive2">{t('receipts.subtitle')}</p>
        </div>
        <Button size="md" onClick={() => createModalRef.current?.open()}>
          {t('receipts.create')}
        </Button>
      </div>

      {isLoading && <ListSkeleton rows={3} rowClassName="h-24" />}

      {!isLoading && ownReceipts.length === 0 && (
        <EmptyState
          icon={<PackageCheck size={40} strokeWidth={1.5} />}
          title={t('receipts.empty')}
        />
      )}

      <ul className="flex flex-col gap-3">
        {ownReceipts.map((receipt) => {
          const isDraft = receipt.status === ReceiptStatus.DRAFT
          return (
            <li key={receipt.id} className="rounded-base bg-white p-4 shadow-base">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="p3 font-semibold">{t('receipts.number', { id: receipt.id })}</p>
                  <p className="t1 text-passive2">
                    {t(`receipts.status.${receipt.status}`)}
                    {receipt.warehouse_name ? ` · ${receipt.warehouse_name}` : ''}
                  </p>
                </div>
                {isDraft && (
                  <div className="flex gap-2">
                    <Button variant="tertiary" size="sm" onClick={() => openItemModal(receipt.id)}>
                      {t('receipts.addItem')}
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-failure"
                      onClick={() => {
                        setCancelId(receipt.id)
                        cancelDialogRef.current?.open()
                      }}
                    >
                      {t('receipts.cancel')}
                    </Button>
                  </div>
                )}
              </div>

              {receipt.items.length > 0 && (
                <ul className="mt-3 flex flex-col divide-y divide-stroke">
                  {receipt.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                      <p className="t1 min-w-0 flex-1 line-clamp-1">{item.product_name}</p>
                      <p className="t1 shrink-0 text-passive2">
                        {item.quantity} {item.measure_unit.code}
                      </p>
                      {isDraft && (
                        <button
                          className="t1 shrink-0 font-medium text-failure"
                          disabled={deleteItem.isPending}
                          onClick={() =>
                            deleteItem.mutate({
                              path: { receipt_id: receipt.id, item_id: item.id },
                            })
                          }
                        >
                          {t('cart.remove')}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isDraft && (
                <p
                  className={cn(
                    't2 mt-3',
                    receipt.items.length > 0 ? 'text-passive2' : 'text-failure',
                  )}
                >
                  {receipt.items.length > 0
                    ? t('receipts.awaitingConfirmation')
                    : t('receipts.addItemsFirst')}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <Modal ref={createModalRef} className="w-full max-w-110 p-6">
        <div className="flex flex-col gap-4">
          <h2 className="p2 font-bold">{t('receipts.create')}</h2>
          <Select
            value={warehouseId}
            onChange={setWarehouseId}
            placeholder={t('receipts.selectWarehouse')}
            options={(warehouses ?? []).map((warehouse) => ({
              value: String(warehouse.id),
              label: warehouse.name,
            }))}
          />
          <div className="flex gap-3">
            <Button
              disabled={!warehouseId || createReceipt.isPending}
              onClick={() =>
                createReceipt.mutate({
                  body: { shop_id: numericStoreId, warehouse_id: Number(warehouseId) },
                })
              }
            >
              {t('receipts.create')}
            </Button>
            <Button variant="tertiary" onClick={() => createModalRef.current?.close()}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal ref={itemModalRef} className="w-full max-w-110 p-6">
        <div className="flex flex-col gap-4">
          <h2 className="p2 font-bold">{t('receipts.addItem')}</h2>
          <Select
            value={productId}
            onChange={setProductId}
            placeholder={t('receipts.selectProduct')}
            options={(products ?? []).map((product) => ({
              value: String(product.id),
              label: getTranslatedName(product.translations, i18n.language),
            }))}
          />
          <Input
            type="number"
            min="0"
            step="0.001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('stock.quantityPlaceholder')}
          />
          <div className="flex gap-3">
            <Button disabled={addItem.isPending} onClick={submitItem}>
              {t('receipts.addItem')}
            </Button>
            <Button variant="tertiary" onClick={() => itemModalRef.current?.close()}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        ref={cancelDialogRef}
        title={t('receipts.cancelTitle')}
        text={t('receipts.cancelText')}
        confirmLabel={t('receipts.cancel')}
        destructive
        busy={cancelReceipt.isPending}
        onConfirm={() => {
          if (cancelId !== null) cancelReceipt.mutate({ path: { receipt_id: cancelId } })
        }}
      />
    </div>
  )
}
