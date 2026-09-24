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

  const { data, isLoading } = useMeAuthMeGet({}, undefined, { enabled: !!token })

  useEffect(() => {
    setProfileLoading(isLoading)
  }, [isLoading, setProfileLoading])

  useEffect(() => {
    if (data) setProfile(data)
  }, [data, setProfile])

  return <>{children}</>
}
