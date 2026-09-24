import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { LocalStorage } from '../../shared/lib/LocalStorage'

import { tk } from './tk'
import { ru } from './ru'
import { en } from './en'
import { tr } from './tr'

/**
 * Язык первого рендера — всегда запасной.
 *
 * Раньше здесь читался localStorage, а на сервере его нет: сервер отдавал
 * страницу по-русски, клиент тут же перерисовывал её по-английски, и React
 * ронял всё дерево с ошибкой несовпадения гидрации. Выбранный язык применяется
 * после монтирования (см. applyStoredLanguage), поэтому первый рендер у сервера
 * и клиента совпадает.
 */
const INITIAL_LANG = 'ru'

i18n.use(initReactI18next).init({
  resources: {
    tk: { translation: tk },
    ru: { translation: ru },
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: INITIAL_LANG,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  LocalStorage.set('lang', lng)
})

/**
 * Применяет сохранённый язык. Вызывать только после монтирования: до него
 * смена языка означала бы расхождение с тем, что отдал сервер.
 */
export const applyStoredLanguage = () => {
  const saved = LocalStorage.get('lang')
  if (saved && saved !== i18n.language) void i18n.changeLanguage(saved)
}

if (import.meta.hot) {
  import.meta.hot.accept(['./en', './ru', './tk', './tr'], ([enMod, ruMod, tkMod, trMod]) => {
    if (enMod) i18n.addResourceBundle('en', 'translation', enMod.en, true, true)
    if (ruMod) i18n.addResourceBundle('ru', 'translation', ruMod.ru, true, true)
    if (tkMod) i18n.addResourceBundle('tk', 'translation', tkMod.tk, true, true)
    if (trMod) i18n.addResourceBundle('tr', 'translation', trMod.tr, true, true)
  })
}

export default i18n
