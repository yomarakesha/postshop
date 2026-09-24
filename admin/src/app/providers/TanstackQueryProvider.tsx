import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { toast } from 'sonner'

import { getErrorMessage } from '@/shared/lib/apiError'

export const TanstackQueryProvider = ({ children }: PropsWithChildren) => {
  // Клиент создавался прямо в теле компонента: на каждый повторный отрисовку
  // получался новый, и весь кэш выбрасывался. useState создаёт его один раз.
  const [client] = useState(
    () =>
      new QueryClient({
        // Ни одна запись в админке не сообщала об ошибке: onError не было ни у
        // одного из пятидесяти хуков мутаций и ни на уровне QueryClient.
        // Создание валюты с занятым кодом отвечало 400, а на экране не
        // менялось ничего. Теперь любая неудачная запись показывает тост, а
        // мутации со своим onError показывают свой текст.
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.onError) return
            toast.error(getErrorMessage(error))
          },
        }),
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
