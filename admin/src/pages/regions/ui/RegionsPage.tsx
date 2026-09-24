import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useRegionsQuery } from '../model/useRegionsQuery'
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

export function RegionsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.REGIONS.update)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useRegionsQuery({ skip, limit, name: search })

  const regions = data?.data ?? []
  const total = readTotalCount(data?.response.headers, regions.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('regions.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/regions/create')}
            permissionCode={PERMISSION_KEYS.REGIONS.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.nameRu')}</TableHead>
              <TableHead>{t('fields.nameTk')}</TableHead>
              <TableHead>{t('fields.nameEn')}</TableHead>
              <TableHead>{t('fields.nameTr')}</TableHead>
              <TableHead>{t('regions.country')}</TableHead>
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
            ) : regions.length > 0 ? (
              regions.map((region) => (
                <TableRow
                  key={region.id}
                  {...rowProps(canEdit ? `/regions/${region.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{region.id}</TableCell>
                  <TableCell className="font-medium">
                    {getTranslationName(region.translations, 'ru') || '—'}
                  </TableCell>
                  <TableCell>{getTranslationName(region.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(region.translations, 'en') || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTranslationName(region.translations, 'tr') || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTranslationName(region.country.translations, i18n.language) || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={region.is_active ? 'success' : 'destructive'}>
                      {region.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(region.created_at)}
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
