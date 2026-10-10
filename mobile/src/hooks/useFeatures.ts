import { useQuery } from '@tanstack/react-query'
import api from '@/api'

type Features = {
  /** Склад платформы (FBO): приёмки и остатки на складах Postshop. */
  fbo_enabled: boolean
}

/**
 * Что включено на этом сервере.
 *
 * Склад платформы выключается одним флагом на бэкенде. Приложение должно об
 * этом знать, иначе предложит выбрать FBO и покажет «Приёмку», которую некому
 * принять. Учёт FBS, когда магазин ведёт остатки сам, флагом не выключается.
 *
 * Пока ответ не пришёл, считаем склад платформы выключенным: показать раздел
 * и тут же его убрать хуже, чем показать с задержкой. То же правило, что на
 * витрине (`shared/hooks/useFeatures.ts`).
 */
const useFeatures = () => {
  const query = useQuery<Features>({
    queryKey: ['features'],
    queryFn: async () => {
      const res = await api.req({ method: 'GET', url: '/features/' })
      return res.data
    },
    // Настройка сервера за сеанс не меняется — перезапрашивать незачем.
    staleTime: Infinity,
    retry: 1,
  })

  return {
    isLoading: query.isPending,
    fboEnabled: query.data?.fbo_enabled ?? false,
  }
}

export default useFeatures
