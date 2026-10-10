import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import tk from './tk.json'
import ru from './ru.json'
import tr from './tr.json'
import storage from '@/store/storage'

i18n
  .use(initReactI18next)
  .use({
    async: true,
    init: Function.prototype,
    type: 'languageDetector',
    detect: async (callback: (language: string) => void) => {
      try {
        const appStoreRaw = storage.mmkv.getString('app-store')
        if (appStoreRaw) {
          const parsed = JSON.parse(appStoreRaw)
          if (parsed?.state?.lang) {
            callback(parsed.state.lang)
            return
          }
        }
      } catch (e) {
        console.error('Failed to parse app-store lang from MMKV', e)
      }
      callback('tk')
    },
  })
  .init({
    resources: {
      tk: { translation: tk },
      en: { translation: en },
      ru: { translation: ru },
      tr: { translation: tr },
    },
    fallbackLng: 'tk',
    react: {
      useSuspense: false,
    },
  })

export default i18n
