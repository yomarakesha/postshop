import { useQuery } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { LocalStorage } from '@/shared/lib/LocalStorage'
import { getMeUsersMeGet } from '@/shared/openapi/requests/sdk.gen'
import { useProfileStore } from '@/shared/store/profileStore'

export function ProfileProvider({ children }: PropsWithChildren) {
  const token = LocalStorage.get('access_token')
  const setProfile = useProfileStore((s) => s.setProfile)

  const { isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await getMeUsersMeGet({ throwOnError: true })
      setProfile(response?.data)
      return response
    },
    enabled: !!token,
  })

  if (!token || isError) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return null
  }

  return <>{children}</>
}
