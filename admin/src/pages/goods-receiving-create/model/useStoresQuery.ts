import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getAllShopsFullShopBasesFullGet, RegistrationStatus } from '@/shared/openapi/requests'

export function useStoresQuery() {
  return useQuery({
    queryKey: ['stores', RegistrationStatus.APPROVED, 'receiving'],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({
        // Магазины брались первыми 500 любого статуса — вместе с заявками на
        // рассмотрении и отклонёнными, — и FBO отбирались уже из них: при
        // росте числа заявок настоящие магазины выпадали из выбора. Статус
        // отбирает сервер; фильтра по типу склада у метода нет, он в форме.
        query: { registration_status: RegistrationStatus.APPROVED, limit: ADMIN_LIST_LIMIT },
        throwOnError: true,
      }),
  })
}
