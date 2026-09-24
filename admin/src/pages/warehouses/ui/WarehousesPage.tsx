import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useWarehousesQuery } from '../model/useWarehousesQuery'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function WarehousesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useWarehousesQuery({ skip, limit, name: search })
  const warehouses = data?.data ?? []
  const total = readTotalCount(data?.response.headers, warehouses.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('warehouses.searchPlaceholder')}
        actions={<CreateButton onClick={() => navigate('/warehouses/create')} />}
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('warehouses.name')}</TableHead>
              <TableHead>{t('warehouses.address')}</TableHead>
              <TableHead>{t('warehouses.phones')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {warehouse.id}
                  </TableCell>
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell className="text-muted-foreground">{warehouse.address}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {warehouse.phone_numbers.join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={warehouse.is_active ? 'success' : 'destructive'}>
                      {warehouse.is_active ? t('active') : t('blocked')}
                    </Badge>
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
