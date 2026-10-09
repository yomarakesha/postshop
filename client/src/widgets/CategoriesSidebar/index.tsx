import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import type { CategoryResponse, CategoryShort } from '#/shared/openapi/requests/types.gen'
import { Accordion, AccordionContent, AccordionItem } from '#/shared/ui/Accordion'
import { useGetCategoriesCategoriesGet } from '#/shared/openapi/queries/queries'
import { useOpenCategories } from '#/shared/lib/useOpenCategories'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { Skeleton } from '#/shared/ui/Skeleton'
import GridIcon from '#/shared/assets/icons/grid.svg?react'

const getCategoryName = (translations: CategoryResponse['translations'], language: string) => {
  return translations.find((t) => t.language === language)?.name ?? translations[0]?.name
}

const EmptyCategories = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-white px-4 py-10 text-center">
      <GridIcon width={24} height={24} className="text-passive1" />
      <p className="t1 text-passive2">{t('categories.empty')}</p>
    </div>
  )
}

const CategoryList = ({
  parentCategories,
  language,
  onSelect,
}: {
  parentCategories: Array<CategoryResponse>
  language: string
  onSelect?: () => void
}) => {
  // Раскрытые разделы помнятся между страницами: свёрнутый раздел раньше
  // раскрывался сам при каждом переходе.
  const { open, onValueChange } = useOpenCategories(
    'categories-open',
    parentCategories.map((category) => String(category.id)),
  )

  // Пустой список раньше давал пустой белый блок без объяснений — понять,
  // грузится он или каталог действительно пуст, было нельзя (C-20).
  return parentCategories.length === 0 ? (
    <EmptyCategories />
  ) : (
    <Accordion
      type="multiple"
      value={open}
      onValueChange={onValueChange}
      className="flex flex-col gap-1"
    >
      {parentCategories.map((category) => {
        // Считаем только активные: иначе у категории со отключёнными подкатегориями
        // остаётся стрелка раскрытия, а список под ней пустой.
        const activeChildren = category.children.filter((child: CategoryShort) => child.is_active)
        const hasChildren = activeChildren.length > 0
        const categoryId = String(category.id)
        return (
          <AccordionItem key={category.id} value={categoryId} className="border-none! group/item">
            {hasChildren ? (
              <AccordionPrimitive.Header className="flex bg-white rounded-lg hover:bg-gray3 transition-colors group-data-[state=open]/item:rounded-b-none">
                <Link
                  to="/categories/$categoryId"
                  params={{ categoryId }}
                  onClick={onSelect}
                  className="flex flex-1 items-center gap-2 px-2 py-1"
                >
                  {category.image_path ? (
                    <img
                      src={getImageUrl(category.image_path)}
                      alt=""
                      className="size-9 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span className="size-9 shrink-0 rounded bg-gray2" />
                  )}
                  <p className="t1 font-semibold text-text">
                    {getCategoryName(category.translations, language)}
                  </p>
                </Link>
                <AccordionPrimitive.Trigger className="px-2 py-1 outline-none group/trig">
                  {/* Стрелки постоянно висели у каждой строки и создавали шум.
                      Появляются при наведении, а у раскрытой категории видны
                      всегда — иначе непонятно, чем её закрыть. */}
                  {/* Стрелки постоянно висели у каждой строки и создавали шум —
                      теперь появляются при наведении. Скрытие ограничено
                      устройствами с наведением: на тач-экране hover не
                      срабатывает, и стрелка не появилась бы никогда. */}
                  <ChevronDown
                    className="size-5 text-passive2 transition-opacity
                               [@media(hover:hover)]:opacity-0 group-hover/item:opacity-100
                               group-data-[state=open]/trig:hidden"
                  />
                  <ChevronUp
                    className="hidden size-5 text-passive2 transition-opacity
                               [@media(hover:hover)]:opacity-0 group-hover/item:opacity-100
                               group-data-[state=open]/trig:block"
                  />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
            ) : (
              <Link
                to="/categories/$categoryId"
                params={{ categoryId }}
                onClick={onSelect}
                className="bg-white px-2 py-1 rounded-lg hover:bg-gray3 transition-colors flex items-center gap-2"
              >
                {category.image_path ? (
                  <img
                    src={getImageUrl(category.image_path)}
                    alt=""
                    className="size-9 shrink-0 rounded object-contain"
                  />
                ) : (
                  <span className="size-9 shrink-0 rounded bg-gray2" />
                )}
                <p className="t1 font-semibold text-text">
                  {getCategoryName(category.translations, language)}
                </p>
              </Link>
            )}
            {/* pb-0 отключает нижний отступ содержимого аккордеона: он давал
                белую полосу под последней подкатегорией, которую подсветка при
                наведении не закрывала. Вместо него отступ отдан самой последней
                строке — тогда её подсветка доходит до края карточки. */}
            {hasChildren && (
              <AccordionContent className="rounded-t-none rounded-b-lg bg-white pb-0">
                <ul className="flex flex-col">
                  {activeChildren.map((child: CategoryShort) => (
                    /* Модификатор last: на самой ссылке не работал: она
                       единственный ребёнок своего li, то есть последняя всегда
                       — и скругление получали все строки. Правило перенесено на
                       li, где соседи настоящие. */
                    <li key={child.id} className="last:[&>a]:rounded-b-lg last:[&>a]:pb-4">
                      <Link
                        to="/categories/$categoryId"
                        params={{ categoryId: String(child.id) }}
                        onClick={onSelect}
                        /* Названия были серыми и читались как отключённые —
                           теперь основной цвет текста, ховер оставляет только
                           подсветку фона. */
                        /* Скругление только у последней строки: rounded-lg
                           стоял на всех, поэтому подсветка средних строк
                           скруглялась с обеих сторон и висела в воздухе
                           посреди списка. */
                        className="t1 flex items-center py-2 pr-2 pl-12 text-text
                                   transition-colors hover:bg-gray3"
                      >
                        {getCategoryName(child.translations, language)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            )}
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

/**
 * Затухание у краёв прокручиваемого списка.
 *
 * Панель категорий высотой с экран, а полоса прокрутки скрыта: последняя
 * карточка обрезалась ровным краем, и выглядело так, будто список не
 * догрузился. Затухание снизу показывает, что дальше есть ещё, сверху — что
 * список уже прокручен. У края, до которого докрутили, затухания нет.
 */
const FADE = '48px'

// `contentKey` — смена содержимого (скелетон → список): новых детей надо
// подписать на наблюдение заново.
const useScrollFade = <T extends HTMLElement>(contentKey: unknown) => {
  const ref = useRef<T>(null)
  const [edges, setEdges] = useState({ top: false, bottom: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const top = el.scrollTop > 1
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
    setEdges((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    // Высота меняется при раскрытии разделов и при изменении окна.
    const observer = new ResizeObserver(update)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [update, contentKey])

  const mask = `linear-gradient(to bottom, ${edges.top ? 'transparent' : 'black'}, black ${FADE}, black calc(100% - ${FADE}), ${edges.bottom ? 'transparent' : 'black'})`

  return { ref, onScroll: update, style: { maskImage: mask, WebkitMaskImage: mask } }
}

export const CategoriesSidebar = () => {
  const { i18n, t } = useTranslation()
  // only_parents: эндпоинт отдаёт плоский список всех категорий вместе с
  // подкатегориями, и с лимитом по умолчанию (20) при 29 категориях верхнего
  // уровня часть просто не доходила — новые категории не появлялись в каталоге.
  // Подкатегории всё равно приходят вложенными в children.
  const { data: categories, isLoading } = useGetCategoriesCategoriesGet({
    query: { is_active: true, only_parents: true, limit: 200 },
  })
  const [isOpen, setIsOpen] = useState(false)

  const parentCategories = (categories ?? []).filter((c) => !c.parent_id)
  const desktopFade = useScrollFade<HTMLElement>(isLoading)

  const skeletons = (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-lg" />
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        ref={desktopFade.ref}
        onScroll={desktopFade.onScroll}
        style={desktopFade.style}
        className={`
          hidden sidebar:block
          w-full max-w-62.5 max-h-[calc(100vh-var(--page-content-top-padding)-24px)]
          sticky top-(--page-content-top-padding) self-start
          overflow-y-auto no-scrollbar
        `}
      >
        {isLoading ? (
          skeletons
        ) : (
          <CategoryList parentCategories={parentCategories} language={i18n.language} />
        )}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="sidebar:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-stroke border-l-0 rounded-r-xl px-1.5 py-3 flex flex-col items-center gap-1.5 shadow-base text-passive2"
        aria-label={t('footer.categories')}
      >
        <GridIcon width={18} height={18} />
        <span className="t2 font-medium [writing-mode:vertical-lr] rotate-180">
          {t('footer.categories')}
        </span>
      </button>

      {/* Mobile drawer */}
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
              className="fixed top-0 left-0 bottom-0 z-60 w-72 bg-white shadow-xl flex flex-col overflow-hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-stroke shrink-0">
                <span className="p3 font-semibold">{t('footer.categories')}</span>
                <button onClick={() => setIsOpen(false)} className="text-passive2">
                  <X size={22} />
                </button>
              </div>
              <div className="overflow-y-auto no-scrollbar flex-1 p-3">
                {isLoading ? (
                  skeletons
                ) : (
                  <CategoryList
                    parentCategories={parentCategories}
                    language={i18n.language}
                    onSelect={() => setIsOpen(false)}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
