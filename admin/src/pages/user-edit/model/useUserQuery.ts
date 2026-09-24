import { useQuery } from '@tanstack/react-query'

import { getUserUsersUserIdGet } from '@/shared/openapi/requests'

export function useUserQuery(userId: number) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () =>
      getUserUsersUserIdGet({
        path: { user_id: userId },
        throwOnError: true,
      }),
  })
}
