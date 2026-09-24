import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { UserStatusSwitch } from './UserStatusSwitch'
import { useUsersQuery } from '../model/useUsersQuery'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { useRowNavigation } from '@/shared/hooks/useRowNavigation'
import { formatDate } from '@/shared/lib/formatDate'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { CreateButton } from '@/widgets/CreateButton'
import { ListToolbar } from '@/widgets/ListToolbar'
import { TablePagination } from '@/widgets/TablePagination'

export function UsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowProps = useRowNavigation()
  const { hasPermission } = useHasPermission()
  const canEdit = hasPermission(PERMISSION_KEYS.USERS.update)
  const canBlock = hasPermission(PERMISSION_KEYS.USERS.block)

  const { page, setPage, search, setSearch, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useUsersQuery({ skip, limit, name: search })

  const users = data?.data ?? []
  const total = readTotalCount(data?.response.headers, users.length)

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('users.searchPlaceholder')}
        actions={
          <CreateButton
            onClick={() => navigate('/users/create')}
            permissionCode={PERMISSION_KEYS.USERS.create}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.fullName')}</TableHead>
              <TableHead>{t('fields.username')}</TableHead>
              <TableHead>{t('fields.phone')}</TableHead>
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              {canBlock && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canBlock ? 7 : 6} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  {...rowProps(canEdit ? `/users/${user.id}/edit` : undefined)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">{user.id}</TableCell>
                  <TableCell className="font-medium">
                    {user.name} {user.surname}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? t('active') : t('blocked')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(user.created_at)}
                  </TableCell>
                  {canBlock && (
                    <TableCell>
                      <UserStatusSwitch userId={user.id} isActive={user.is_active} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canBlock ? 7 : 6}
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
    </div>
  )
}
