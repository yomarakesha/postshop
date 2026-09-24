import type { ReactNode } from 'react'

import { useFeatures } from '@/shared/hooks/useFeatures'
import { Spinner } from '@/shared/ui/spinner'

/**
 * Обёртка для страниц склада платформы (FBO).
 *
 * Скрыть раздел из бокового меню мало: страницы остаются доступны по прямой
 * ссылке, а из закладок и истории браузера туда попадают чаще, чем кажется.
 * При выключенном складе (`FBO_ENABLED=false`) страница объясняет, почему
 * раздела нет, — вместо пустой таблицы или ошибки запроса.
 */
export function RequireFbo({ children }: { children: ReactNode }) {
  const { isLoading, fboEnabled } = useFeatures()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!fboEnabled) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="font-semibold">Склад платформы отключён</p>
        <p className="text-muted-foreground text-sm">
          Платформа сейчас не принимает товар на хранение: магазины работают по FBS.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
