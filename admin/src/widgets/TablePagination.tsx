import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'

interface Props {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

/**
 * Постраничная навигация под таблицей.
 *
 * Кнопок перехода по страницам не было ни на одной странице админки: лимит
 * подняли до 500, чтобы списки показывались целиком, но запись № 501 оставалась
 * недостижимой. Общее число берётся из заголовка X-Total-Count, который бэкенд
 * отдаёт давно и который никто не читал, — править API не понадобилось.
 */
export function TablePagination({ page, pageSize, total, onPageChange }: Props) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / pageSize))

  if (total <= pageSize) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground tabular-nums">
        {t('pagination.range', { from, to, total })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {t('pagination.prev')}
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {t('pagination.pageOf', { page, pages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pagination.next')}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
