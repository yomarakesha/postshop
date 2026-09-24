import { useQuery } from '@tanstack/react-query'

import { client } from '@/shared/openapi/requests/client.gen'

interface Features {
  /** Склад платформы (FBO): склады, приёмки, остатки на складах. */
  fbo_enabled: boolean
}

/**
 * Что включено на этом сервере.
 *
 * Склад платформы (FBO) выключается одним флагом на бэкенде (`FBO_ENABLED`).
 * Без этого запроса админка показывала бы «Склады» и «Приёмку товара», когда
 * платформа товар не хранит: страницы открывались бы, а ручки отвечали 404.
 * Учёт FBS (магазин сам ведёт остатки) флагом не выключается. Флаг живёт только на сервере — копии в `.env` фронтендов
 * разъезжаются.
 *
 * До ответа считаем склад выключенным: показать раздел и тут же убрать хуже,
 * чем показать с задержкой.
 */
export function useFeatures() {
  const query = useQuery({
    queryKey: ['features'],
    queryFn: async (): Promise<Features> => {
      const response = await client.get<Features>({ url: '/features/' })
      return response.data as Features
    },
    // Настройка сервера за сессию не меняется.
    staleTime: Infinity,
    retry: 1,
  })

  return {
    isLoading: query.isPending,
    fboEnabled: query.data?.fbo_enabled ?? false,
  }
}
