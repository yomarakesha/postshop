import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '#/shared/utils/cn'

interface Props {
  children: ReactNode
  /**
   * Класс появления сайдбара на широком экране, например `min-[1150px]:flex`.
   * Передаётся строкой из места вызова, а не собирается здесь: Tailwind ищет
   * классы в исходниках, и собранное из частей имя он не увидит.
   */
  sidebarVisibility: string
  /** Обратный класс для кнопки и панели, например `min-[1150px]:hidden`. */
  toggleVisibility: string
}

/**
 * Оболочка блока фильтров: сайдбар на широком экране, кнопка и выдвижная панель
 * на узком.
 *
 * Приём был написан дважды — на странице бренда и на странице магазина, — а на
 * странице категории и в результатах поиска его забыли. Последствия разные, но
 * одинаково тяжёлые: на странице категории фильтров на телефоне не было совсем,
 * а в поиске сайдбар оставался в строке рядом с сеткой из трёх колонок, и при
 * ширине 390 px карточки товаров сжимались до 20 px. Поэтому оболочка вынесена
 * в одно место, а страницы описывают только сами фильтры.
 */
export const FilterShell = ({ children, sidebarVisibility, toggleVisibility }: Props) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <aside
        /* overflow-y-auto без ограничения высоты не делает ничего: элементу
           нечего переполнять, он просто растёт под содержимое. Поэтому длинный
           список фильтров прокручивался вместе со страницей, а не сам по себе,
           и sticky тоже не срабатывал — прилипать нечему, панель выше экрана.
           Высота считается так же, как у корзины справа (она работает верно):
           экран минус верхний отступ страницы. max-h, а не h: короткому списку
           фильтров незачем растягиваться на весь экран пустотой. */
        className={cn(
          `hidden flex-col gap-3 w-full max-w-60.75
           max-h-[calc(100vh-var(--page-content-top-padding)-24px)]
           sticky top-(--page-content-top-padding) self-start
           overflow-y-auto no-scrollbar
           [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full
           [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent`,
          sidebarVisibility,
        )}
      >
        {children}
      </aside>

      {/* Кнопка у левого края: на узком экране места под постоянный сайдбар нет,
          а прятать фильтры совсем — значит лишить телефон цены, сортировки,
          бренда и магазина. */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          `fixed left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5
           bg-white border border-stroke border-l-0 rounded-r-xl px-1.5 py-3
           shadow-base text-passive2`,
          toggleVisibility,
        )}
        aria-label={t('filter.title')}
      >
        <SlidersHorizontal width={18} height={18} />
        <span className="t2 font-medium [writing-mode:vertical-lr] rotate-180">
          {t('filter.title')}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-60 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed top-0 left-0 bottom-0 z-60 w-72 bg-gray2 shadow-xl flex flex-col overflow-hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-stroke bg-white shrink-0">
                <span className="p3 font-semibold">{t('filter.title')}</span>
                <button onClick={() => setIsOpen(false)} className="text-passive2">
                  <X size={22} />
                </button>
              </div>
              <div className="overflow-y-auto no-scrollbar flex-1 p-3 flex flex-col gap-3">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
