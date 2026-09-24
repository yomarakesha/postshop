import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useProfileStore } from '#/shared/stores/profileStore'
import { Spinner } from '#/shared/ui/Spinner'

export const Route = createFileRoute('/my-store/')({
  component: MyStoreIndex,
})

/**
 * Точка входа в кабинет без указания магазина.
 *
 * У макета /my-store не было индексной страницы: адрес отдавал только шапку и
 * подвал, то есть пустой экран без объяснения. Теперь он уводит туда, где
 * человеку есть что делать: в свой магазин, а если магазина нет — в профиль,
 * откуда можно стать продавцом.
 */
function MyStoreIndex() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const isProfileLoading = useProfileStore((s) => s.isProfileLoading)
  const shops = profile?.shops ?? []

  useEffect(() => {
    if (isProfileLoading) return
    if (shops.length > 0) {
      navigate({
        to: '/my-store/$storeId',
        params: { storeId: String(shops[0].id) },
        replace: true,
      })
      return
    }
    navigate({ to: '/profile', replace: true })
  }, [isProfileLoading, shops, navigate])

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Spinner />
      <p className="t1 text-passive2">{t('header.selectStore')}</p>
    </div>
  )
}
