import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCitiesQuery } from '../model/useCitiesQuery'
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

export function CitiesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.CITIES.update)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useCitiesQuery({ skip, limit, name: search })

  const cities = data?.data ?? []
  const total = readTotalCount(data?.response.headers, cities.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('cities.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/cities/create')}
            permissionCode={PERMISSION_KEYS.CITIES.create}
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
              <TableHead>{t('cities.region')}</TableHead>
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
            ) : cities.length > 0 ? (
              cities.map((city) => (
                <TableRow
                  key={city.id}
                  {...rowProps(canEdit ? `/cities/${city.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{city.id}</TableCell>
                  <TableCell className="font-medium">
                    {getTranslationName(city.translations, 'ru') || '—'}
                  </TableCell>
                  <TableCell>{getTranslationName(city.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(city.translations, 'en') || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTranslationName(city.translations, 'tr') || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTranslationName(city.region.translations, i18n.language) || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={city.is_active ? 'success' : 'destructive'}>
                      {city.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(city.created_at)}
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
