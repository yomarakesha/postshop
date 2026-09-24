type Translation = { language: string; name: string }

export const getTranslationName = (
  translations: Translation[],
  lang: string,
  fallbackLang = 'ru',
): string =>
  translations.find((t) => t.language === lang)?.name ??
  translations.find((t) => t.language === fallbackLang)?.name ??
  ''
