import { useQuery } from '@tanstack/react-query'

import { getAllShopsFullShopBasesFullGet, RegistrationStatus } from '@/shared/openapi/requests'

export function useStoresQuery(
  search: string | undefined,
  paging: { skip: number; limit: number },
) {
  return useQuery({
    queryKey: ['stores', RegistrationStatus.APPROVED, search, paging],
    queryFn: () =>
      getAllShopsFullShopBasesFullGet({
        // Одобренные отбирались в браузере из первых 500 магазинов любого
        // статуса: чем больше заявок (в том числе отклонённых), тем больше
        // настоящих магазинов не попадало в список. Отбор — на сервере.
        query: {
          search: search || undefined,
          registration_status: RegistrationStatus.APPROVED,
          ...paging,
        },
        throwOnError: true,
      }),
  })
}
