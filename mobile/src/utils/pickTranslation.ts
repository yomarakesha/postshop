/**
 * Выбор перевода по текущему языку интерфейса.
 *
 * Зачем: в карточке товара и на экране товара язык был захардкожен
 * (`translations.find((t) => t.language === "tk")`, рядом стоял комментарий
 * «TODO: Dynamic language»), поэтому в русской локали название показывалось
 * по-туркменски: «Smartfon Ýyldyz Neo 6, 128 GB, 6 GB RAM».
 *
 * Порядок поиска:
 *   1) точное совпадение с текущим языком (`ru`);
 *   2) базовый язык, если i18next отдал регион (`ru-RU` -> `ru`);
 *   3) язык приложения по умолчанию (`tk`, как в `fallbackLng`);
 *   4) первый доступный перевод — лучше чужой язык, чем пустая строка.
 */

/** Язык по умолчанию — тот же, что `fallbackLng` в src/localization/index.ts. */
export const FALLBACK_LANGUAGE = "tk";

type AnyTranslation = { language?: string | null };

/** Приводит `ru-RU` / `RU` к `ru`. */
const normalize = (language?: string | null) =>
  language ? language.toLowerCase().split("-")[0] : "";

/**
 * Возвращает перевод на текущем языке, а если его нет — по цепочке запасных
 * вариантов. `undefined` только если переводов нет вообще.
 */
export const pickTranslation = <T extends AnyTranslation>(
  translations: T[] | null | undefined,
  language?: string | null,
): T | undefined => {
  if (!translations?.length) return undefined;

  const wanted = normalize(language);
  const byLanguage = (code: string) =>
    code ? translations.find((item) => normalize(item.language) === code) : undefined;

  return (
    byLanguage(wanted) || byLanguage(FALLBACK_LANGUAGE) || translations[0]
  );
};

/**
 * Название на текущем языке. Пустая строка, если переводов нет вовсе —
 * вызывающий код сам решает, что показать вместо неё.
 */
export const pickTranslatedName = (
  translations: { language?: string | null; name?: string | null }[] | null | undefined,
  language?: string | null,
): string => pickTranslation(translations, language)?.name?.trim() || "";

/** Описание на текущем языке. Пустая строка — значит описания нет. */
export const pickTranslatedDescription = (
  translations:
    | { language?: string | null; description?: string | null }[]
    | null
    | undefined,
  language?: string | null,
): string =>
  pickTranslation(translations, language)?.description?.trim() || "";

export default pickTranslation;
