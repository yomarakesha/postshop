import { useQuery } from '@tanstack/react-query'

import { listAllPermissionsPermissionsGet } from '@/shared/openapi/requests'

/**
 * Полный список прав системы.
 *
 * В запрос передавался limit, которого у метода нет: он отдаёт весь каталог
 * прав без постраничной выдачи, и параметр молча игнорировался.
 */
export function usePermissionsQuery() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => listAllPermissionsPermissionsGet({ throwOnError: true }),
  })
}
