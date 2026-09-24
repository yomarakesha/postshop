import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '#/shared/lib/apiError'

/**
 * Повторять запрос имеет смысл только при сбое на стороне сервера.
 * Ответы 4xx (нет прав, не прошла валидация, не найдено) повторной попыткой
 * не исправляются — она лишь удваивает нагрузку и засоряет консоль.
 */
const retryOnlyServerErrors = (failureCount: number, error: unknown) => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status: unknown }).status
      : undefined

  if (typeof status === 'number' && status >= 400 && status < 500) return false
  return failureCount < 1
}

export function getContext() {
  const queryClient = new QueryClient({
    // Ни одна запись в витрине не сообщала об ошибке: не было ни try/catch, ни
    // onError с сообщением. Нажал «В корзину» — товар не добавился, реакции
    // нет; сохранил название магазина — модалка просто осталась открытой.
    // Теперь любая неудачная запись показывает тост.
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Если у мутации есть свой onError, текст выбирает она: иначе
        // пользователь увидел бы два сообщения об одной ошибке.
        if (mutation.options.onError) return
        toast.error(getErrorMessage(error))
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: retryOnlyServerErrors,
      },
      mutations: {
        retry: retryOnlyServerErrors,
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
