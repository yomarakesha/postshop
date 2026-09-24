import { Languages, Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LocalStorage } from '@/shared/lib/LocalStorage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  const changeLanguage = (locale: 'ru' | 'tk') => {
    i18n.changeLanguage(locale)
    LocalStorage.set('locale', locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Languages size={20} />
        <span className="text-sm font-medium">
          {currentLang === 'ru' ? 'Русский' : 'Türkmençe'}
        </span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-auto">
        <DropdownMenuItem onClick={() => changeLanguage('ru')}>
          Русский
          {currentLang === 'ru' && <Check className="size-4 ml-auto" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => changeLanguage('tk')}>
          Türkmençe
          {currentLang === 'tk' && <Check className="size-4 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
