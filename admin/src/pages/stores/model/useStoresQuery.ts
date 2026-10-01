import { useQuery } from '@tanstack/react-query'

import { ADMIN_LIST_LIMIT } from '@/shared/constants/pagination'
import { getAllShopsFullShopBasesFullGet, RegistrationStatus } from '@/shared/openapi/requests'

export function useStoresQuery(search?: string) {
  return useQuery({
    queryKey: ['stores', RegistrationStatus.APPROVED, search],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({
        // Одобренные отбирались в браузере из первых 500 магазинов любого
        // статуса: чем больше заявок (в том числе отклонённых), тем больше
        // настоящих магазинов не попадало в список. Отбор — на сервере.
        query: {
          search: search || undefined,
          registration_status: RegistrationStatus.APPROVED,
          limit: ADMIN_LIST_LIMIT,
        },
        throwOnError: true,
      }),
  })
}
