import { useQuery } from '@tanstack/react-query'

import {
  getClientsStatisticsStatisticsClientsGet,
  getOrdersStatisticsStatisticsOrdersGet,
  getShopsStatisticsStatisticsShopsGet,
} from '@/shared/openapi/requests'

/**
 * Сводные показатели для главной.
 *
 * В запросы передавался limit, которого у этих методов нет: они отдают сводку,
 * а не список. Параметр молча игнорировался и создавал впечатление, что выдача
 * ограничена.
 */
export function useShopsStatisticsQuery() {
  return useQuery({
    queryKey: ['statistics', 'shops'],
    queryFn: () =>
      getShopsStatisticsStatisticsShopsGet({
        throwOnError: true,
      }),
  })
}

export function useClientsStatisticsQuery() {
  return useQuery({
    queryKey: ['statistics', 'clients'],
    queryFn: () =>
      getClientsStatisticsStatisticsClientsGet({
        throwOnError: true,
      }),
  })
}

export function useOrdersStatisticsQuery() {
  return useQuery({
    queryKey: ['statistics', 'orders'],
    queryFn: () =>
      getOrdersStatisticsStatisticsOrdersGet({
        throwOnError: true,
      }),
  })
}
