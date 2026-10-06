import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useContactUsRequestsQuery } from '../model/useContactUsRequestsQuery'
import { useSetHandledMutation } from '../model/useSetHandledMutation'
import { readTotalCount, useListControls } from '@/shared/hooks/useListControls'
import { formatDate } from '@/shared/lib/formatDate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TablePagination } from '@/widgets/TablePagination'

export function ContactUsRequestsPage() {
  const { t } = useTranslation()

  // Списки грузились одной порцией до 500 записей без страниц: дальше
  // запись было не найти. Теперь — постранично, с общим числом с сервера.
  const { page, setPage, pageSize, skip, limit } = useListControls()
  const { data, isLoading } = useContactUsRequestsQuery({ skip, limit })
  const total = readTotalCount(data?.response.headers, data?.data.length ?? 0)
  const setHandled = useSetHandledMutation()

  const requests = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('fields.name')}</TableHead>
              <TableHead>{t('fields.phone')}</TableHead>
              <TableHead>{t('fields.message')}</TableHead>
              <TableHead>{t('fields.createdAt')}</TableHead>
              {/* Отметка «обработано» была в API, но не на экране: разобранные
                  обращения не отличались от новых, и звонили повторно. */}
              <TableHead>{t('fields.status')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{request.id}</TableCell>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell className="text-muted-foreground">{request.phone}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground">
                    {request.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDate(request.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={request.is_handled ? 'success' : 'warning'}>
                      {t(request.is_handled ? 'contactUs.handled' : 'contactUs.new')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Снять отметку тоже можно: обращение могли пометить по
                        ошибке, и без обратного хода оно исчезало бы из работы. */}
                    <Button
                      size="sm"
                      variant={request.is_handled ? 'outline' : 'default'}
                      disabled={setHandled.isPending}
                      onClick={() =>
                        setHandled.mutate({
                          contactId: request.id,
                          handled: !request.is_handled,
                        })
                      }
                    >
                      {t(request.is_handled ? 'contactUs.markNew' : 'contactUs.markHandled')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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
