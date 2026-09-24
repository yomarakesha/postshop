import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { ru } from './ru'
import { tk } from './tk'
import { LocalStorage } from '../../shared/lib/LocalStorage'

const savedLang = LocalStorage.get('lang') || 'ru'

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    tk: { translation: tk },
  },
  lng: savedLang,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  LocalStorage.set('lang', lng)
})

export default i18n
