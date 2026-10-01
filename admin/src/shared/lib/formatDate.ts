import i18n from '@/app/localization'

/**
 * Часовой пояс, в котором показываются все даты админки.
 *
 * Сервер отдаёт время в UTC с явной зоной («…Z»), а toLocaleString без
 * timeZone переводил его в пояс компьютера, за которым сидит сотрудник. У
 * ноутбука с неверно выставленным поясом (или открытого из-за границы) заказ,
 * оформленный в 10:00 по Ашхабаду, показывался как 05:00 или 08:00 — время
 * расходилось с тем, что видят покупатель и продавец. Люди, заказы и склады
 * — в Туркменистане, поэтому пояс задан явно.
 */
export const APP_TIME_ZONE = 'Asia/Ashgabat'

/**
 * Дата без времени («2026-10-01», формат date в OpenAPI) — это календарный
 * день, а не момент времени. new Date() читает её как полночь UTC; при
 * переводе в любой пояс западнее UTC она уезжала бы на день назад. Такой день
 * показываем как есть — в UTC, без сдвига.
 */
const isPlainDate = (date: Date | string) =>
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)

/**
 * Дата и время в локали выбранного языка.
 *
 * Раньше вызывался toLocaleDateString() без аргументов: формат брался из
 * настроек операционной системы, а не из языка интерфейса — в русской админке
 * даты выглядели как 8/11/2026. Времени не было вовсе, поэтому заказы одного
 * дня нельзя было отличить по порядку.
 */
export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return ''
  // У календарного дня нет времени: «01.10.2026, 05:00» только путало.
  if (isPlainDate(date)) return formatDateOnly(date)
  return new Date(date).toLocaleString(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIME_ZONE,
  })
}

/** Только дата — там, где время не нужно (период, срок действия). */
export const formatDateOnly = (date: Date | string | null | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: isPlainDate(date) ? 'UTC' : APP_TIME_ZONE,
  })
}
