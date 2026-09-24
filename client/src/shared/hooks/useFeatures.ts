import { useQuery } from '@tanstack/react-query'
import { client } from '#/shared/openapi/requests/client.gen'

interface Features {
  /** Склад платформы (FBO): приёмки и остатки на складах Postshop. */
  fbo_enabled: boolean
}

/**
 * Что включено на этом сервере.
 *
 * Склад платформы выключается одним флагом на бэкенде (`FBO_ENABLED`). Витрина
 * должна знать об этом, иначе предлагает выбрать FBO и показывает «Приёмку»,
 * которую некому принять. Учёт FBS (магазин сам ведёт остатки) флагом не
 * выключается. Флаг живёт в одном месте — на сервере, — а не копией в каждом
 * `.env`.
 *
 * Пока ответ не пришёл, считаем склад платформы выключенным: показать раздел
 * и тут же его убрать хуже, чем показать с задержкой.
 */
export function useFeatures() {
  const query = useQuery({
    queryKey: ['features'],
    queryFn: async (): Promise<Features> => {
      const response = await client.get<Features>({ url: '/features/' })
      return response.data as Features
    },
    // Настройка сервера за сессию не меняется — перезапрашивать незачем.
    staleTime: Infinity,
    retry: 1,
  })

  return {
    isLoading: query.isPending,
    fboEnabled: query.data?.fbo_enabled ?? false,
  }
}
