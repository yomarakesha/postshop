import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Свойства строки таблицы, которая ведёт на карточку записи.
 *
 * Строки были обычными <tr> с обработчиком клика: ни с клавиатуры их открыть
 * было нельзя, ни фокус на них не попадал — экранный диктор о переходе не
 * сообщал вовсе. Затронуто 22 списочные страницы, поэтому свойства собраны в
 * одном месте.
 *
 * role="link" и обработка Enter с пробелом дают клавиатурный доступ. Открытие в
 * новой вкладке требует настоящей ссылки внутри ячейки — <tr> её заменить не
 * может, — поэтому в первой ячейке таблиц стоит ссылка на ту же карточку.
 */
export function useRowNavigation() {
  const navigate = useNavigate()

  return (href: string | undefined) => {
    if (!href) return {}
    return {
      role: 'link',
      tabIndex: 0,
      className: 'cursor-pointer',
      onClick: () => navigate(href),
      onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        // Пробел иначе прокрутит страницу вместо перехода.
        event.preventDefault()
        navigate(href)
      },
    }
  }
}
