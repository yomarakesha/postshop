import { useMemo, useState } from 'react'

/** Размер страницы в таблицах админки. */
export const PAGE_SIZE = 20

/**
 * Состояние списка: страница и строка поиска.
 *
 * Кнопок постраничной навигации не было ни на одной странице админки, а лимит
 * был поднят до 500, чтобы списки вообще показывались целиком — но запись
 * № 501 оставалась недостижимой. Поиск при этом либо отсутствовал, либо шёл на
 * клиенте по уже загруженной странице, то есть находил не то, что искали.
 *
 * Хук держит страницу и поисковую строку, отдаёт skip и limit для запроса и
 * сам сбрасывает страницу при смене строки поиска: иначе после ввода можно
 * оказаться на пятой странице результата, которых всего два.
 */
export function useListControls(pageSize: number = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const [search, setSearchValue] = useState('')

  const setSearch = (value: string) => {
    setSearchValue(value)
    setPage(1)
  }

  const query = useMemo(() => ({ skip: (page - 1) * pageSize, limit: pageSize }), [page, pageSize])

  return { page, setPage, search, setSearch, pageSize, ...query }
}

/**
 * Общее число записей из заголовка X-Total-Count.
 *
 * Заголовок бэкенд отдаёт давно, но никто его не читал: страницы не знали, где
 * конец списка.
 */
export function readTotalCount(headers: Headers | undefined, fallback: number): number {
  const raw = headers?.get('X-Total-Count')
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}
