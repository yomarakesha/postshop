import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '#/shared/ui/Button'
import { useProfileStore } from '#/shared/stores/profileStore'

export const LogoutPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const clearAuth = useProfileStore((s) => s.clearAuth)

  const handleCancel = () => {
    navigate({ to: '..' })
  }

  const handleLogout = () => {
    clearAuth()
    navigate({ to: '/' })
  }

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl shadow-base p-6">
      <div className="flex flex-col gap-2">
        <h1 className="p1 font-bold text-center">{t('logoutPage.title')}</h1>
        <p className="p3 text-passive2 text-center">{t('logoutPage.subtitle')}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button className="bg-failure" onClick={handleLogout}>
          {t('logoutPage.confirm')}
        </Button>
        <Button variant="tertiary" onClick={handleCancel}>
          {t('logoutPage.cancel')}
        </Button>
      </div>
    </div>
  )
}
