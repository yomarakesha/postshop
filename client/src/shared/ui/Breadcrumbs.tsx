import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '#/shared/utils/cn'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: Array<BreadcrumbItem>
}

/**
 * Строка пути над страницей: «Главная › Раздел › …».
 *
 * Длинное звено (название товара, поисковый запрос) раньше уезжало на
 * вторую строку целиком, хотя справа оставалось место. Теперь последнее звено
 * занимает остаток строки и обрезается многоточием в самом её конце; полный
 * текст виден во всплывающей подсказке. На узком экране строка переносится:
 * иначе от названия остаётся пара букв.
 */
export const Breadcrumbs = ({ items }: Props) => {
  return (
    <nav className="flex min-w-0 flex-wrap items-center gap-1 text-sm lg:flex-nowrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div
            key={index}
            className={cn(
              'flex min-w-0 max-w-full items-center gap-1',
              isLast ? 'lg:flex-1' : 'lg:shrink-0',
            )}
          >
            {index > 0 && <ChevronRight className="size-5 shrink-0 text-gray-400" />}
            {/* Ссылкой становится любое звено с адресом, в том числе последнее:
                на странице товара последнее звено — его категория, и по нему
                возвращаются к списку. */}
            {item.to ? (
              <Link
                to={item.to}
                title={item.label}
                className={cn(
                  't1 truncate font-medium text-passive1 hover:text-blue-main',
                  isLast && 'min-w-0 flex-1',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                title={item.label}
                className={cn('truncate', isLast ? 't-1 min-w-0 flex-1 font-semibold' : 't1')}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
