import { useEffect } from 'react'
import { useMeAuthMeGet } from '#/shared/openapi/queries'
import { useProfileStore } from '#/shared/stores/profileStore'

interface Props {
  children: React.ReactNode
}

export const ProfileProvider = ({ children }: Props) => {
  const token = useProfileStore((s) => s.token)
  const setProfile = useProfileStore((s) => s.setProfile)
  const setProfileLoading = useProfileStore((s) => s.setProfileLoading)

  // Профиль грузился один раз при входе: решение платформы по магазину
  // (одобрен, отклонён, закрыт) до продавца не доходило, пока он не
  // перезагрузит страницу. Перечитываем при возврате на вкладку; новое
  // уведомление перечитывает его сразу (см. NotificationsBell).
  const { data, isLoading } = useMeAuthMeGet({}, undefined, {
    enabled: !!token,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    setProfileLoading(isLoading)
  }, [isLoading, setProfileLoading])

  useEffect(() => {
    if (data) setProfile(data)
  }, [data, setProfile])

  return <>{children}</>
}
