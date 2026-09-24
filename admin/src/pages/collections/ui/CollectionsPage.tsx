import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCollectionsQuery } from '../model/useCollectionsQuery'
import { useDeleteCollectionMutation } from '../model/useDeleteCollectionMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { formatDate } from '@/shared/lib/formatDate'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function CollectionsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.COLLECTIONS.update)
  const canDelete = hasPermission(PERMISSION_KEYS.COLLECTIONS.delete)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useCollectionsQuery({ skip, limit, name: search })

  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null)
  const deleteCollection = useDeleteCollectionMutation()

  const collections = data?.data ?? []
  const total = readTotalCount(data?.response.headers, collections.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('collections.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/collections/create')}
            permissionCode={PERMISSION_KEYS.COLLECTIONS.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              {canDelete && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 5 : 4} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : collections.length > 0 ? (
              collections.map((collection) => (
                <TableRow
                  key={collection.id}
                  className={canEdit ? 'cursor-pointer' : undefined}
                  onClick={
                    canEdit ? () => navigate(`/collections/${collection.id}/edit`) : undefined
                  }
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {collection.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTranslationName(collection.translations, i18n.language)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={collection.is_active ? 'success' : 'destructive'}>
                      {collection.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(collection.created_at)}
                  </TableCell>
                  {canDelete && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t('actions.delete')}
                        // Клик по строке открывает подборку — всплытие надо
                        // остановить, иначе корзина уведёт на редактирование.
                        onClick={(event) => {
                          event.stopPropagation()
                          setToDelete({
                            id: collection.id,
                            name: getTranslationName(collection.translations, i18n.language),
                          })
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
                  colSpan={canDelete ? 5 : 4}
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
        title={t('confirm.deleteCollectionTitle')}
        description={t('confirm.deleteCollectionText', { name: toDelete?.name ?? '' })}
        confirmLabel={t('actions.delete')}
        destructive
        busy={deleteCollection.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteCollection.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </div>
  )
}
