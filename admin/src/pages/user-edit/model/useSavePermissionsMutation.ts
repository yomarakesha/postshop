import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setUserPermissionsPermissionsUserIdPermissionsPut } from '@/shared/openapi/requests'

export function useSavePermissionsMutation(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (permissionCodes: string[]) =>
      setUserPermissionsPermissionsUserIdPermissionsPut({
        path: { user_id: userId },
        body: { permission_codes: permissionCodes },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
    },
  })
}
