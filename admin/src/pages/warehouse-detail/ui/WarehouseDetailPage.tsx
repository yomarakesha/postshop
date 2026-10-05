import { Loader2, MapPin, Pencil, Phone, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useWarehouseBalancesQuery } from '../model/useWarehouseBalancesQuery'
import { useWarehouseOutgoMutation } from '../model/useWarehouseOutgoMutation'
import type { OutgoKind } from '../model/useWarehouseOutgoMutation'
import { useWarehouseQuery } from '@/pages/warehouse-edit/model/useWarehouseQuery'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { WarehouseProductBalance } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const warehouseId = Number(id)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const { data, isLoading } = useWarehouseQuery(warehouseId)
  const warehouse = data?.data

  // Таблица «Товары на складе» была строкой-заглушкой без запроса и всегда
  // сообщала, что склад пуст. Поле поиска рядом стояло без value и onChange —
  // мёртвое.
  const { data: balancesData, isLoading: isBalancesLoading } = useWarehouseBalancesQuery(
    warehouseId,
    search,
  )
  const balances = balancesData?.data ?? []

  const { hasPermission } = useHasPermission()
  const canOutgo = hasPermission(PERMISSION_KEYS.WAREHOUSE_OPERATIONS.create)
  const outgo = useWarehouseOutgoMutation()
  const [outgoTarget, setOutgoTarget] = useState<{
    row: WarehouseProductBalance
    kind: OutgoKind
  } | null>(null)
  const [outgoQuantity, setOutgoQuantity] = useState('')
  const openOutgo = (row: WarehouseProductBalance, kind: OutgoKind) => {
    setOutgoQuantity('')
    setOutgoTarget({ row, kind })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!warehouse) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border px-5 py-5">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{warehouse.name}</h2>
            <Badge variant={warehouse.is_active ? 'success' : 'destructive'}>
              {warehouse.is_active ? t('active') : t('blocked')}
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {warehouse.address}
            </span>
            {warehouse.phone_numbers.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {warehouse.phone_numbers.join(', ')}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/warehouses/${id}/edit`)}>
          <Pencil className="size-4" />
          {t('warehouses.edit')}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('warehouses.products')}</h3>
        </div>

        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t('warehouses.searchProducts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>{t('warehouses.productName')}</TableHead>
                <TableHead>{t('warehouses.productPrice')}</TableHead>
                <TableHead>{t('warehouses.productQuantity')}</TableHead>
                {canOutgo && <TableHead className="w-0" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isBalancesLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </TableCell>
                </TableRow>
              )}

              {!isBalancesLoading &&
                balances.map((row, index) => (
                  <TableRow
                    key={row.product_id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/products/${row.product_id}`)}
                  >
                    <TableCell className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {getTranslationName(row.product.translations, i18n.language)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.product.price} {row.product.currency?.code ?? ''}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.balance}{' '}
                      {getTranslationName(row.measure_unit?.translations ?? [], i18n.language)}
                    </TableCell>
                    {canOutgo && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOutgo(row, 'return_to_shop')}
                          >
                            {t('warehouses.returnToShop')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => openOutgo(row, 'write_off')}
                          >
                            {t('warehouses.writeOff')}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

              {!isBalancesLoading && balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {t('warehouses.noProducts')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={outgoTarget !== null}
        onOpenChange={(open) => !open && setOutgoTarget(null)}
        title={
          outgoTarget
            ? t(
                outgoTarget.kind === 'write_off'
                  ? 'warehouses.writeOffTitle'
                  : 'warehouses.returnToShopTitle',
                {
                  product: getTranslationName(outgoTarget.row.product.translations, i18n.language),
                },
              )
            : ''
        }
        description={
          <div className="space-y-2">
            <p>
              {t(
                outgoTarget?.kind === 'write_off'
                  ? 'warehouses.writeOffText'
                  : 'warehouses.returnToShopText',
                { count: Number(outgoTarget?.row.balance ?? 0) },
              )}
            </p>
            <Input
              type="number"
              min="0"
              step="0.001"
              autoFocus
              value={outgoQuantity}
              onChange={(e) => setOutgoQuantity(e.target.value)}
              placeholder={t('warehouses.outgoQuantity')}
            />
          </div>
        }
        confirmLabel={t(
          outgoTarget?.kind === 'write_off' ? 'warehouses.writeOff' : 'warehouses.returnToShop',
        )}
        destructive={outgoTarget?.kind === 'write_off'}
        busy={outgo.isPending}
        onConfirm={() => {
          const amount = Number(outgoQuantity)
          if (!outgoTarget || !Number.isFinite(amount) || amount <= 0) return
          outgo.mutate(
            {
              warehouseId,
              shopId: outgoTarget.row.product.shop_base_id,
              productId: outgoTarget.row.product_id,
              measureUnitId: outgoTarget.row.product.measure_unit_id,
              kind: outgoTarget.kind,
              quantity: outgoQuantity,
            },
            { onSuccess: () => setOutgoTarget(null) },
          )
        }}
      />
    </div>
  )
}
