import { useTranslation } from 'react-i18next'
import { Checkbox } from '#/shared/ui/Checkbox'

export type SortOption = 'most_expensive' | 'most_cheap' | 'recently_added' | 'with_discounts'

const sortOptions: Array<{ key: string; value: SortOption }> = [
  { key: 'sort.expensiveToCheap', value: 'most_expensive' },
  { key: 'sort.cheapToExpensive', value: 'most_cheap' },
  { key: 'sort.newProducts', value: 'recently_added' },
  { key: 'sort.discount', value: 'with_discounts' },
]

interface SortFilterProps {
  value?: SortOption
  onChange: (value: SortOption | undefined) => void
}

export const SortFilter = ({ value, onChange }: SortFilterProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      <p className="p3 font-semibold">{t('filter.sort')}</p>
      <ul className="flex flex-col gap-1">
        {sortOptions.map((option) => (
          <li key={option.value} className="py-1.25">
            <button
              onClick={() => onChange(value === option.value ? undefined : option.value)}
              className="flex gap-2 items-center w-full"
            >
              <Checkbox checked={value === option.value} />
              <span className="t1 font-medium">{t(option.key)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
