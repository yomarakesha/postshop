interface Translation {
  language: string
  name: string
}

/**
 * Название на текущем языке интерфейса.
 * Если перевода на этот язык нет, берётся первый доступный — чтобы вместо
 * названия никогда не появлялась пустая строка.
 */
export const getTranslatedName = <T extends Translation>(
  translations: Array<T> | undefined,
  language: string,
): string => {
  if (!translations?.length) return ''
  return translations.find((t) => t.language === language)?.name ?? translations[0].name
}
