import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCurrenciesQuery } from '../model/useCurrenciesQuery'
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

export function CurrenciesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.CURRENCIES.update)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useCurrenciesQuery({ skip, limit, name: search })

  const currencies = data?.data ?? []
  const total = readTotalCount(data?.response.headers, currencies.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('currencies.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/currencies/create')}
            permissionCode={PERMISSION_KEYS.CURRENCIES.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('currencies.code')}</TableHead>
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
            ) : currencies.length > 0 ? (
              currencies.map((currency) => (
                <TableRow
                  key={currency.id}
                  {...rowProps(canEdit ? `/currencies/${currency.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {currency.id}
                  </TableCell>
                  <TableCell>
                    <Badge>{currency.code}</Badge>
                  </TableCell>
                  <TableCell>{getTranslationName(currency.translations, 'ru') || '—'}</TableCell>
                  <TableCell>{getTranslationName(currency.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(currency.translations, 'en') || '—'}</TableCell>
                  <TableCell>{getTranslationName(currency.translations, 'tr') || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={currency.is_active ? 'success' : 'destructive'}>
                      {currency.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(currency.created_at)}
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
