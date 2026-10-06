import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useShopBasesQuery } from '../model/useShopBasesQuery'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { RegistrationStatus } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TablePagination } from '@/widgets/TablePagination'

const FILTERABLE_STATUSES = [RegistrationStatus.PENDING, RegistrationStatus.REJECTED] as const

const statusBadgeVariant = {
  [RegistrationStatus.PENDING]: 'warning',
  [RegistrationStatus.APPROVED]: 'success',
  [RegistrationStatus.REJECTED]: 'destructive',
  [RegistrationStatus.SUSPENDED]: 'default',
} as const

export function BecomeStoreRequestsPage() {
  const { t } = useTranslation()
  const rowProps = useRowNavigation()

  const [status, setStatus] = useState<RegistrationStatus>(RegistrationStatus.PENDING)

  // Списки грузились одной порцией до 500 записей без страниц: дальше
  // запись было не найти. Теперь — постранично, с общим числом с сервера.
  const { page, setPage, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useShopBasesQuery(status, { skip, limit })
  const total = readTotalCount(data?.response.headers, data?.data.length ?? 0)

  // Статус отбирается на сервере: раньше отбор шёл в браузере среди первых
  // 500 заявок любого статуса.
  const filteredRequests = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as RegistrationStatus)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERABLE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`registrationStatus.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>{t('becomeStoreRequests.legalEntityType')}</TableHead>
              <TableHead>{t('becomeStoreRequests.documents')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((shop) => (
                <TableRow key={shop.id} {...rowProps(`/become-store-requests/${shop.id}`)}>
                  <TableCell>{shop.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t(shop.legal_entity_type)}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {shop.documents.length}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[shop.registration_status]}>
                      {t(`registrationStatus.${shop.registration_status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(shop.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  )
}
