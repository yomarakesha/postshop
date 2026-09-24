import { Loader2, MapPin, Pencil, Phone, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { useWarehouseBalancesQuery } from '../model/useWarehouseBalancesQuery'
import { useWarehouseQuery } from '@/pages/warehouse-edit/model/useWarehouseQuery'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isBalancesLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
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
                  </TableRow>
                ))}

              {!isBalancesLoading && balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    {t('warehouses.noProducts')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
