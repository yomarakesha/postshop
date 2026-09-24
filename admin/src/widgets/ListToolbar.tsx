import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  /** Кнопка создания и прочее, что стоит справа. */
  actions?: ReactNode
}

/**
 * Строка над таблицей: поиск слева, действия справа.
 *
 * Поле поиска было только у трёх списков из четырнадцати, хотя строки-подсказки
 * для него лежали в локализации во всех. Собрано отдельным блоком, чтобы
 * добавить поиск в список значило добавить одну строку, а не собирать разметку
 * заново.
 */
export function ListToolbar({ search, onSearchChange, placeholder, actions }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <InputGroup className="max-w-xs">
        <InputGroupAddon>
          <InputGroupText>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder={placeholder ?? t('search')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      {actions}
    </div>
  )
}
