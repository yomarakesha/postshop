import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '#/shared/ui/Input'

export interface PriceRange {
  priceFrom?: string
  priceTo?: string
}

interface PriceRangeFilterProps {
  value: PriceRange
  onChange: (value: PriceRange) => void
}

export const PriceRangeFilter = ({ value, onChange }: PriceRangeFilterProps) => {
  const [min, setMin] = useState(value.priceFrom ?? '')
  const [max, setMax] = useState(value.priceTo ?? '')
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({
        priceFrom: min || undefined,
        priceTo: max || undefined,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [min, max])

  return (
    <div className="flex flex-col gap-3">
      <p className="p3 font-semibold">{t('filter.priceRange')}</p>
      <div className="flex items-center gap-1">
        <Input
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={t('filter.priceFrom')}
          className="text-passive2 h-10 px-3 py-0"
        />
        <Input
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={t('filter.priceTo')}
          className="text-passive2 h-10 px-3 py-0"
        />
      </div>
    </div>
  )
}
