import { ImageIcon, Loader2, Minus, Plus, Search, Store, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateReceiptMutation } from '../model/useCreateReceiptMutation'
import { useMeasureUnitsQuery } from '../model/useMeasureUnitsQuery'
import { useProductsQuery } from '../model/useProductsQuery'
import { useStoresQuery } from '../model/useStoresQuery'
import { useWarehousesQuery } from '@/pages/warehouses/model/useWarehousesQuery'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { WarehouseType } from '@/shared/openapi/requests'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

interface SelectedProduct {
  id: number
  name: string
  image?: string
  price?: string
  quantity: number | string
  measureUnitId: number
}

export function CreateGoodsReceivingPage() {
  const { t, i18n } = useTranslation()
  const [warehouseId, setWarehouseId] = useState('')
  const [storeSearch, setStoreSearch] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false)
  const storeInputRef = useRef<HTMLInputElement>(null)
  const [productSearch, setProductSearch] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [askReset, setAskReset] = useState(false)

  // Здесь нужен весь список складов для выбора, а не страница: их единицы.
  const { data: warehousesData } = useWarehousesQuery({ skip: 0, limit: 200 })
  const warehouses = useMemo(
    () => (warehousesData?.data ?? []).filter((w) => w.is_active),
    [warehousesData],
  )

  const { data: storesData } = useStoresQuery()
  // Приёмка на склад платформы — только для магазинов FBO. Магазин FBS хранит
  // товар у себя, и сервер такой документ отклонит.
  const stores = useMemo(
    () =>
      (storesData?.data ?? []).filter(
        (store) => store.additional?.warehouse_type === WarehouseType.FBO,
      ),
    [storesData],
  )

  const { data: measureUnitsData } = useMeasureUnitsQuery()
  const measureUnits = useMemo(
    () => (measureUnitsData?.data ?? []).filter((u) => u.is_active),
    [measureUnitsData],
  )

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId),
    [stores, selectedStoreId],
  )

  const filteredStores = useMemo(() => {
    const query = storeSearch.trim().toLowerCase()
    if (!query) return stores
    return stores.filter((store) => {
      const name = store.additional?.name ?? ''
      return name.toLowerCase().includes(query)
    })
  }, [stores, storeSearch])

  const selectStore = (storeId: number) => {
    setSelectedStoreId(storeId)
    setStoreSearch('')
    setIsStoreDropdownOpen(false)
    setSelectedProducts([])
    setProductSearch('')
  }

  const clearStore = () => {
    setSelectedStoreId(null)
    setStoreSearch('')
    setSelectedProducts([])
    setProductSearch('')
  }

  const { data: productsData } = useProductsQuery(selectedStoreId)
  const products = useMemo(() => productsData?.data ?? [], [productsData])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return []
    return products.filter((product) => {
      if (selectedProducts.some((p) => p.id === product.id)) return false
      const name =
        getTranslationName(product.translations, i18n.language) ||
        product.translations[0]?.name ||
        ''
      return name.toLowerCase().includes(query)
    })
  }, [products, productSearch, i18n.language, selectedProducts])

  const addProduct = (product: (typeof products)[number]) => {
    const name =
      getTranslationName(product.translations, i18n.language) ||
      product.translations[0]?.name ||
      `Product #${product.id}`
    setSelectedProducts((prev) => [
      ...prev,
      {
        id: product.id,
        name,
        image: product.images?.[0],
        price: product.price,
        quantity: 1,
        measureUnitId: measureUnits[0]?.id ?? 0,
      },
    ])
    setProductSearch('')
  }

  const updateQuantity = (id: number, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, Number(p.quantity) + delta) } : p,
      ),
    )
  }

  const setQuantity = (id: number, value: string) => {
    if (value === '') {
      setSelectedProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: value } : p)))
      return
    }
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      setSelectedProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: num } : p)))
    }
  }

  const clampQuantity = (id: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const num = typeof p.quantity === 'number' ? p.quantity : parseInt(String(p.quantity), 10)
        return { ...p, quantity: isNaN(num) || num < 1 ? 1 : num }
      }),
    )
  }

  const updateMeasureUnit = (id: number, measureUnitId: number) => {
    setSelectedProducts((prev) => prev.map((p) => (p.id === id ? { ...p, measureUnitId } : p)))
  }

  const removeProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleReset = () => {
    setWarehouseId('')
    setSelectedStoreId(null)
    setStoreSearch('')
    setSelectedProducts([])
    setProductSearch('')
  }

  const createMutation = useCreateReceiptMutation()

  const handleAccept = () => {
    if (!selectedStoreId || !warehouseId || selectedProducts.length === 0) return

    createMutation.mutate({
      receipt: {
        shop_id: selectedStoreId,
        warehouse_id: Number(warehouseId),
      },
      items: selectedProducts.map((p) => ({
        product_id: p.id,
        measure_unit_id: p.measureUnitId,
        quantity: Number(p.quantity) || 1,
      })),
    })
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-64 space-y-1.5">
            <Label>{t('goodsReceiving.warehouse')}</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder={t('goodsReceiving.selectWarehouse')} />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={String(wh.id)}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-72 space-y-1.5">
            <Label>{t('goodsReceiving.store')}</Label>
            <div className="relative">
              {selectedStore ? (
                <div className="flex h-9 items-center justify-between rounded-md border bg-background px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {selectedStore.additional?.logo_path ? (
                      <img
                        src={buildFileUrl(selectedStore.additional.logo_path)}
                        alt=""
                        className="size-5 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <Store className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm">
                      {selectedStore.additional?.name ?? `#${selectedStore.id}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={clearStore}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ) : (
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>
                      <Search className="size-4 text-muted-foreground" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={storeInputRef}
                    placeholder={t('goodsReceiving.searchStorePlaceholder')}
                    value={storeSearch}
                    onChange={(e) => {
                      setStoreSearch(e.target.value)
                      setIsStoreDropdownOpen(true)
                    }}
                    onFocus={() => setIsStoreDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsStoreDropdownOpen(false), 200)}
                  />
                </InputGroup>
              )}

              {!selectedStore && isStoreDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-popover shadow-lg">
                  {filteredStores.length > 0 ? (
                    filteredStores.map((store) => (
                      <button
                        key={store.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                        onClick={() => selectStore(store.id)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {store.additional?.logo_path ? (
                            <img
                              src={buildFileUrl(store.additional.logo_path)}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <Store className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {store.additional?.name ?? `#${store.id}`}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">#{store.id}</span>
                      </button>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t('goodsReceiving.onlyFbo')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative flex-1 space-y-1.5">
            <Label>{t('goodsReceiving.searchProducts')}</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <Search className="size-4 text-muted-foreground" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t('goodsReceiving.searchPlaceholder')}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </InputGroup>

            {productSearch.trim() && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-popover shadow-lg">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const name =
                      getTranslationName(product.translations, i18n.language) ||
                      product.translations[0]?.name ||
                      `Product #${product.id}`
                    return (
                      <button
                        key={product.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                        onClick={() => addProduct(product)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {product.images?.[0] ? (
                            <img
                              src={buildFileUrl(product.images[0])}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{name}</p>
                          {product.price != null && (
                            <p className="text-xs text-muted-foreground">{product.price} TMT</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          #{product.id}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t('goodsReceiving.noProducts')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('goodsReceiving.productName')}</TableHead>
                <TableHead>{t('goodsReceiving.price')}</TableHead>
                <TableHead>{t('goodsReceiving.measureUnit')}</TableHead>
                <TableHead>{t('goodsReceiving.quantity')}</TableHead>
                <TableHead className="w-20 text-right">{t('goodsReceiving.operations')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProducts.length > 0 ? (
                selectedProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {product.image ? (
                            <img
                              src={buildFileUrl(product.image)}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {product.price != null ? `${product.price} TMT` : '—'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={String(product.measureUnitId)}
                        onValueChange={(v) => updateMeasureUnit(product.id, Number(v))}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {measureUnits.map((unit) => (
                            <SelectItem key={unit.id} value={String(unit.id)}>
                              {unit.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={Number(product.quantity) <= 1}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <input
                          type="number"
                          min={1}
                          className="h-7 w-16 rounded-md border bg-transparent text-center tabular-nums text-sm outline-none focus:ring-1 focus:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={product.quantity}
                          onChange={(e) => setQuantity(product.id, e.target.value)}
                          onBlur={() => clampQuantity(product.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {t('goodsReceiving.emptyTable')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Сброс стирал весь набранный документ одним кликом. */}
          <Button
            variant="outline"
            onClick={() => setAskReset(true)}
            disabled={createMutation.isPending}
          >
            {t('goodsReceiving.reset')}
          </Button>
          <Button
            disabled={
              selectedProducts.length === 0 ||
              !warehouseId ||
              !selectedStoreId ||
              createMutation.isPending
            }
            onClick={handleAccept}
          >
            {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('goodsReceiving.accept')}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={askReset}
        onOpenChange={setAskReset}
        title={t('confirm.resetReceiptTitle')}
        description={t('confirm.resetReceiptText')}
        confirmLabel={t('goodsReceiving.reset')}
        destructive
        onConfirm={handleReset}
      />
    </>
  )
}
