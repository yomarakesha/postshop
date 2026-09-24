import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useBannersQuery } from '../model/useBannersQuery'
import { useDeleteBannerMutation } from '../model/useDeleteBannerMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function BannersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.BANNERS.update)
  const canDelete = hasPermission(PERMISSION_KEYS.BANNERS.delete)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useBannersQuery({ skip, limit, name: search })

  // Баннер удаляется вместе с картинками, вернуть его нельзя — поэтому через
  // подтверждение, как и остальные необратимые действия в админке.
  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null)
  const deleteBanner = useDeleteBannerMutation()

  const banners = data?.data ?? []
  const total = readTotalCount(data?.response.headers, banners.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('banners.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/banners/create')}
            permissionCode={PERMISSION_KEYS.BANNERS.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('banners.position')}</TableHead>
              <TableHead>{t('banners.priority')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('banners.startDate')}</TableHead>
              <TableHead>{t('banners.endDate')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              {canDelete && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 9 : 8} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : banners.length > 0 ? (
              banners.map((banner) => (
                <TableRow
                  key={banner.id}
                  {...rowProps(canEdit ? `/banners/${banner.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{banner.id}</TableCell>
                  <TableCell className="font-medium">{banner.name}</TableCell>
                  {/* Выводилось сырое значение перечисления — в таблице было видно
                      home_middle и home_bottom, хотя переводы для них есть и в
                      формах используются правильно. */}
                  <TableCell>{t(`banners.positions.${banner.position}`)}</TableCell>
                  <TableCell className="tabular-nums">{banner.priority}</TableCell>
                  <TableCell>
                    <Badge variant={banner.is_active ? 'success' : 'destructive'}>
                      {banner.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {banner.start_date ? formatDate(banner.start_date) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {banner.end_date ? formatDate(banner.end_date) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(banner.created_at)}
                  </TableCell>
                  {canDelete && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t('actions.delete')}
                        // Строка сама по себе — ссылка на карточку: без
                        // остановки всплытия клик по корзине увёл бы на
                        // редактирование вместо вопроса об удалении.
                        onClick={(event) => {
                          event.stopPropagation()
                          setToDelete({ id: banner.id, name: banner.name })
                        }}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canDelete ? 9 : 8}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('confirm.deleteBannerTitle')}
        description={t('confirm.deleteBannerText', { name: toDelete?.name ?? '' })}
        confirmLabel={t('actions.delete')}
        destructive
        busy={deleteBanner.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteBanner.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </div>
  )
}
