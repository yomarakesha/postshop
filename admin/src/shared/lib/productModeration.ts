import type { QueryClient } from '@tanstack/react-query'

import { isApiError } from './apiError'
import type { getModerationQueueProductsModerationGet } from '@/shared/openapi/requests'

/**
 * Ключи запросов модерации товаров — в одном месте.
 *
 * Карточка товара на модерации читалась под ключом ['moderation-product', id],
 * а одобрение и отклонение сбрасывали ['products', id] — ключ, которого не
 * было ни у одного запроса модерации, зато совпадавший с приёмкой товара
 * (['products', shopBaseId]): решение по товару №7 перезапрашивало товары
 * магазина №7, а сама карточка оставалась со старым статусом. Теперь все
 * ключи модерации лежат под ['products', 'moderation'], и сброс очереди
 * заодно сбрасывает карточки.
 */
export const productModerationKeys = {
  queue: ['products', 'moderation'] as const,
  count: ['products', 'moderation-count'] as const,
  detail: (productId: number) => ['products', 'moderation', productId] as const,
  /** Ключ мутаций: по нему список видит все идущие решения, а не только последнее. */
  decideAll: ['products', 'moderate'] as const,
  decide: (decision: ModerationDecision) => ['products', 'moderate', decision] as const,
}

export type ModerationDecision = 'approved' | 'declined'

/** Итог решения: записано сейчас или товар уже был в этом статусе. */
export type ModerationOutcome = 'done' | 'already'

type ModerationQueueData = Awaited<ReturnType<typeof getModerationQueueProductsModerationGet<true>>>

/**
 * Ответ 400 «Product is already approved/declined» значит, что нужное
 * состояние уже достигнуто — повторным нажатием или другим модератором.
 * Раньше это показывалось как ошибка «Не удалось выполнить», хотя товар был
 * одобрен с первого раза, и строка так и висела «На модерации».
 */
const isAlreadyModerated = (error: unknown, decision: ModerationDecision) =>
  isApiError(error) && error.status === 400 && error.detail === `Product is already ${decision}`

/** Выполняет решение, считая «уже одобрен/отклонён» успехом, а не ошибкой. */
export const runModerationDecision = async (
  request: () => Promise<unknown>,
  decision: ModerationDecision,
): Promise<ModerationOutcome> => {
  try {
    await request()
    return 'done'
  } catch (error) {
    if (isAlreadyModerated(error, decision)) return 'already'
    throw error
  }
}

/**
 * Убирает товар из очереди в кэше сразу, не дожидаясь перезапроса.
 *
 * Раньше строка оставалась в таблице до конца перезапроса очереди, а её
 * кнопки снова становились активными сразу после ответа: модератор нажимал
 * «Одобрить» ещё раз и получал 400 «Product is already approved».
 */
export const removeFromModerationQueue = (queryClient: QueryClient, productId: number) =>
  queryClient.setQueryData<ModerationQueueData>(productModerationKeys.queue, (old) =>
    old ? { ...old, data: old.data.filter((product) => product.id !== productId) } : old,
  )

/**
 * Перезапрос очереди (вместе с карточками) и счётчика в меню.
 *
 * Возвращает промис: мутация, вернувшая его из onSettled, остаётся в
 * состоянии pending до конца перезапроса, и кнопки не оживают раньше, чем
 * на экране появится настоящий статус. Вызывается и при ошибке — иначе после
 * отказа сервера устаревшая строка так и оставалась на месте.
 */
export const refreshModeration = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: productModerationKeys.queue }),
    queryClient.invalidateQueries({ queryKey: productModerationKeys.count }),
  ])
