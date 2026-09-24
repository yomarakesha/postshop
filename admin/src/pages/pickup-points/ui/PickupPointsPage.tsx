import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { usePickupPointsQuery } from '../model/usePickupPointsQuery'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function PickupPointsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = usePickupPointsQuery({ skip, limit, name: search })
  const pickupPoints = data?.data ?? []
  const total = readTotalCount(data?.response.headers, pickupPoints.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('pickupPoints.searchPlaceholder')}
        actions={<CreateButton onClick={() => navigate('/pickup-points/create')} />}
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('pickupPoints.name')}</TableHead>
              <TableHead>{t('pickupPoints.address')}</TableHead>
              <TableHead>{t('pickupPoints.city')}</TableHead>
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
            ) : pickupPoints.length > 0 ? (
              pickupPoints.map((point) => (
                <TableRow
                  key={point.id}
                  onClick={() => navigate(`/pickup-points/${point.id}/edit`)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-muted-foreground tabular-nums">{point.id}</TableCell>
                  <TableCell className="font-medium">{point.name}</TableCell>
                  <TableCell className="text-muted-foreground">{point.address}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {point.city ? getTranslationName(point.city.translations, i18n.language) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={point.is_active ? 'success' : 'destructive'}>
                      {point.is_active ? t('active') : t('blocked')}
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
