import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

/**
 * Страница для неизвестного адреса.
 *
 * Маршрута-заглушки не было: любой неверный адрес отдавал тело нулевой длины,
 * то есть полностью пустую страницу без объяснения и без выхода.
 */
export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.text')}</p>
      <Button asChild>
        <Link to="/">{t('notFound.home')}</Link>
      </Button>
    </div>
  )
}
