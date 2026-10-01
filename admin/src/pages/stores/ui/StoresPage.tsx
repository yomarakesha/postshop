import { Loader2, Search, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useStoresQuery } from '../model/useStoresQuery'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { RegistrationStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { WarehouseTypeBadge } from '@/widgets/WarehouseTypeBadge'

const statusBadgeVariant = {
  [RegistrationStatus.PENDING]: 'warning',
  [RegistrationStatus.APPROVED]: 'success',
  [RegistrationStatus.REJECTED]: 'destructive',
  [RegistrationStatus.SUSPENDED]: 'default',
} as const

export function StoresPage() {
  const { t } = useTranslation()
  const rowProps = useRowNavigation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  const { data, isLoading } = useStoresQuery(debouncedSearch)

  const stores = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t('stores.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('stores.logo')}</TableHead>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('becomeStoreRequests.legalEntityType')}</TableHead>
              <TableHead>{t('stores.warehouseType')}</TableHead>
              <TableHead>{t('becomeStoreRequests.registrationStatus')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : stores.length > 0 ? (
              stores.map((shop) => (
                <TableRow key={shop.id} {...rowProps(`/stores/${shop.id}`)}>
                  <TableCell className="text-muted-foreground tabular-nums">{shop.id}</TableCell>
                  <TableCell>
                    <div
                      className="flex size-9 items-center justify-center overflow-hidden rounded-lg border bg-muted"
                      style={
                        shop.additional?.color
                          ? { backgroundColor: shop.additional.color }
                          : undefined
                      }
                    >
                      {shop.additional?.logo_path ? (
                        <img
                          src={buildFileUrl(shop.additional.logo_path)}
                          alt={shop.additional?.name ?? ''}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Store className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{shop.additional?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t(shop.legal_entity_type)}
                  </TableCell>
                  <TableCell>
                    <WarehouseTypeBadge type={shop.additional?.warehouse_type} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[shop.registration_status]}>
                      {t(`registrationStatus.${shop.registration_status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shop.is_active ? 'success' : 'destructive'}>
                      {shop.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(shop.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
