/**
 * Ждёт запись и возвращает `undefined`, если она не удалась.
 *
 * Клиент теперь бросает на ошибочных ответах (см. app/setupApiClient.ts), а об
 * ошибке уже сообщил глобальный обработчик — тостом с понятным текстом.
 * Обработчикам форм остаётся только не падать: непойманное отклонение внутри
 * `onSubmit` оставляет форму в состоянии «Отправка…» навсегда, и повторить
 * попытку становится нельзя.
 *
 * Поэтому вместо
 *
 *     const result = await mutation.mutateAsync(…)
 *     if (result.data) { … }
 *
 * пишем
 *
 *     const result = await settled(mutation.mutateAsync(…))
 *     if (result?.data) { … }
 *
 * Свой текст ошибки, если он нужен, задаётся через onError самой мутации —
 * глобальный обработчик тогда молчит.
 */
export const settled = <T>(promise: Promise<T>): Promise<T | undefined> =>
  promise.catch(() => undefined)
