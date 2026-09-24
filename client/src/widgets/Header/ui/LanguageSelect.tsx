import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import CaretIcon from '#/shared/assets/icons/caret.svg?react'

const languages = [
  { label: 'Türkmen', value: 'tk', flag: '/images/tk.webp' },
  { label: 'Русский', value: 'ru', flag: '/images/ru.webp' },
  { label: 'English', value: 'en', flag: '/images/en.webp' },
  { label: 'Türkçe', value: 'tr', flag: '/images/tr.webp' },
]

interface LanguageSelectProps {
  variant?: 'default' | 'light'
}

/**
 * Выбор языка выпадающим списком.
 *
 * Раньше открывалось модальное окно во весь экран: для переключения из четырёх
 * вариантов это слишком тяжёлый шаг — окно перекрывает страницу и требует
 * отдельного закрытия.
 */
export const LanguageSelect = ({ variant = 'default' }: LanguageSelectProps) => {
  const { i18n } = useTranslation()
  const selected = i18n.language
  // Язык может прийти с регионом («ru-RU»), поэтому сверяем по началу строки.
  const current = languages.find((lang) => selected.startsWith(lang.value)) ?? languages[0]

  return (
    // modal={false} обязателен: в модальном режиме Radix блокирует прокрутку
    // страницы и убирает полосу прокрутки, из-за чего содержимое становится
    // шире и вся страница как будто скачком увеличивается при открытии списка.
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={
          variant === 'light'
            ? // Рамка и отступы как у плашки города рядом — так это читается
              // кнопкой, а не подписью. Содержимое повторяет строку списка:
              // флаг и полное название языка вместо кода из двух букв.
              'flex items-center gap-2 rounded-lg border border-stroke bg-gray2 px-3 py-2.5 ' +
              't1 font-medium text-text outline-none hover:border-passive1 ' +
              'data-[state=open]:border-passive1 transition-colors'
            : 'flex items-center gap-1.5 bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 ' +
              'transition-colors t2 font-medium outline-none'
        }
      >
        {variant === 'light' ? (
          <>
            <img src={current.flag} alt="" className="h-5 w-7 shrink-0 rounded-sm object-cover" />
            <span>{current.label}</span>
          </>
        ) : (
          <>
            <Globe size={15} />
            <span>{selected.toUpperCase()}</span>
            <CaretIcon width={10} height={6} />
          </>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-45 rounded-xl border border-stroke bg-white p-1.5 shadow-base"
        >
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.value}
              onSelect={() => i18n.changeLanguage(lang.value)}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 t1 outline-none
                         data-[highlighted]:bg-gray2 transition-colors"
            >
              <img src={lang.flag} alt="" className="h-5 w-7 shrink-0 rounded-sm object-cover" />
              {/* Без flex-1: он растягивал подпись на всю ширину и отбрасывал
                  точку к правому краю — между названием и отметкой зиял провал. */}
              <span className={`font-medium ${selected === lang.value ? 'text-blue-main' : ''}`}>
                {lang.label}
              </span>
              {/* Была галочка: рядом с названием она читалась как отдельное
                  действие. Точка того же цвета, что подпись, — просто отметка. */}
              {selected === lang.value && (
                <span className="size-1.5 shrink-0 rounded-full bg-blue-main" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
