import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCountriesQuery } from '../model/useCountriesQuery'
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

export function CountriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.COUNTRIES.update)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useCountriesQuery({ skip, limit, name: search })

  const countries = data?.data ?? []
  const total = readTotalCount(data?.response.headers, countries.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('countries.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/countries/create')}
            permissionCode={PERMISSION_KEYS.COUNTRIES.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('countries.isoCode')}</TableHead>
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
            ) : countries.length > 0 ? (
              countries.map((country) => (
                <TableRow
                  key={country.id}
                  {...rowProps(canEdit ? `/countries/${country.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{country.id}</TableCell>
                  <TableCell>
                    <Badge>{country.iso_code}</Badge>
                  </TableCell>
                  <TableCell>{getTranslationName(country.translations, 'ru') || '—'}</TableCell>
                  <TableCell>{getTranslationName(country.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(country.translations, 'en') || '—'}</TableCell>
                  <TableCell>{getTranslationName(country.translations, 'tr') || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={country.is_active ? 'success' : 'destructive'}>
                      {country.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(country.created_at)}
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
