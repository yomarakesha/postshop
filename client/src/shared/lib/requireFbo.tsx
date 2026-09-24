import type { ReactNode } from 'react'
import { EmptyState } from '#/shared/ui/EmptyState'
import { Spinner } from '#/shared/ui/Spinner'
import { useFeatures } from '#/shared/hooks/useFeatures'

/**
 * Обёртка для страниц склада платформы (FBO).
 *
 * Убрать пункт из меню мало: страницы остаются доступны по прямой ссылке, а
 * из закладок и истории браузера туда попадают чаще, чем кажется. При
 * выключенном складе платформы (`FBO_ENABLED=false`) страница объясняет,
 * почему раздела нет, — вместо пустой таблицы или ошибки запроса.
 *
 * Остатки магазинов FBS этой обёрткой не закрываются: их учёт есть всегда.
 */
export function RequireFbo({ children }: { children: ReactNode }) {
  const { isLoading, fboEnabled } = useFeatures()

  if (isLoading) return <Spinner />
  if (!fboEnabled) {
    return (
      <EmptyState
        title="Склад платформы отключён"
        hint="Приёмки не ведутся: платформа сейчас не принимает товар на хранение."
      />
    )
  }

  return <>{children}</>
}
