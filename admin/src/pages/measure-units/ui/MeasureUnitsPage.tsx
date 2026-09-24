import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useMeasureUnitsQuery } from '../model/useMeasureUnitsQuery'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function MeasureUnitsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.MEASURE_UNITS.update)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useMeasureUnitsQuery({ skip, limit, name: search })

  const units = data?.data ?? []
  const total = readTotalCount(data?.response.headers, units.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('measureUnits.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/measure-units/create')}
            permissionCode={PERMISSION_KEYS.MEASURE_UNITS.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('measureUnits.code')}</TableHead>
              <TableHead>{t('fields.nameRu')}</TableHead>
              <TableHead>{t('fields.nameTk')}</TableHead>
              <TableHead>{t('fields.nameEn')}</TableHead>
              <TableHead>{t('fields.nameTr')}</TableHead>
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
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow
                  key={unit.id}
                  {...rowProps(canEdit ? `/measure-units/${unit.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{unit.id}</TableCell>
                  <TableCell>
                    <Badge>{unit.code}</Badge>
                  </TableCell>
                  <TableCell>{getTranslationName(unit.translations, 'ru') || '—'}</TableCell>
                  <TableCell>{getTranslationName(unit.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(unit.translations, 'en') || '—'}</TableCell>
                  <TableCell>{getTranslationName(unit.translations, 'tr') || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={unit.is_active ? 'success' : 'destructive'}>
                      {unit.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(unit.created_at)}
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

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  )
}
