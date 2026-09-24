import { ImageIcon, Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCategoriesQuery } from '../model/useCategoriesQuery'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { formatDate } from '@/shared/lib/formatDate'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Badge } from '@/shared/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { TablePagination } from '@/widgets/TablePagination'

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.CATEGORIES.update)

  const { page, setPage, pageSize, skip, limit } = useListControls()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timeout)
  }, [search])

  // Иначе после ввода можно оказаться на пятой странице результата, которых
  // всего два.
  useEffect(() => setPage(1), [debouncedSearch, setPage])

  const { data, isLoading } = useCategoriesQuery({ skip, limit, search: debouncedSearch })

  const categories = data?.data ?? []
  const total = readTotalCount(data?.response.headers, categories.length)

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
            placeholder={t('categories.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <CreateButton
          onClick={() => navigate('/categories/create')}
          permissionCode={PERMISSION_KEYS.CATEGORIES.create}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.image')}</TableHead>
              <TableHead>{t('fields.nameRu')}</TableHead>
              <TableHead>{t('fields.nameTk')}</TableHead>
              <TableHead>{t('fields.nameEn')}</TableHead>
              <TableHead>{t('fields.nameTr')}</TableHead>
              <TableHead>{t('categories.parent')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  {...rowProps(canEdit ? `/categories/${category.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {category.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      {category.image_path ? (
                        <img
                          src={buildFileUrl(category.image_path)}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTranslationName(category.translations, 'ru') || '—'}
                  </TableCell>
                  <TableCell>{getTranslationName(category.translations, 'tk') || '—'}</TableCell>
                  <TableCell>{getTranslationName(category.translations, 'en') || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTranslationName(category.translations, 'tr') || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.parent
                      ? getTranslationName(category.parent.translations, i18n.language) || '—'
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? 'success' : 'destructive'}>
                      {category.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(category.created_at)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
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
