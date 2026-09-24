import i18n from '@/app/localization'

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
  return new Date(date).toLocaleString(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Только дата — там, где время не нужно (период, срок действия). */
export const formatDateOnly = (date: Date | string | null | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
