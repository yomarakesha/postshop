import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { BrandFilter } from '../../../widgets/Filters/BrandFilter'
import { PriceRangeFilter } from '../../../widgets/Filters/PriceRangeFilter'
import { SortFilter } from '../../../widgets/Filters/SortFilter'
import { StoreFilter } from '../../../widgets/Filters/StoreFilter'
import { FilterShell } from '../../../widgets/Filters/FilterShell'
import type { PriceRange } from '../../../widgets/Filters/PriceRangeFilter'
import type { SortOption } from '../../../widgets/Filters/SortFilter'

interface CategoryFilterSidebarProps {
  categoryId: number
  sort?: SortOption
  onSortChange: (value: SortOption | undefined) => void
  priceRange: PriceRange
  onPriceRangeChange: (value: PriceRange) => void
  selectedBrands: Array<number>
  onBrandsChange: (value: Array<number>) => void
  selectedStores: Array<number>
  onStoresChange: (value: Array<number>) => void
}

export const CategoryFilterSidebar = ({
  categoryId,
  sort,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  selectedBrands,
  onBrandsChange,
  selectedStores,
  onStoresChange,
}: CategoryFilterSidebarProps) => {
  const { t } = useTranslation()

  const hasFilters =
    !!sort ||
    !!priceRange.priceFrom ||
    !!priceRange.priceTo ||
    selectedBrands.length > 0 ||
    selectedStores.length > 0

  const clearAll = () => {
    onSortChange(undefined)
    onPriceRangeChange({})
    onBrandsChange([])
    onStoresChange([])
  }

  return (
    <FilterShell sidebarVisibility="min-[1200px]:flex" toggleVisibility="min-[1200px]:hidden">
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 self-start t1 font-semibold text-failure"
        >
          <X size={14} />
          {t('filter.clearAll')}
        </button>
      )}
      <div className="bg-white rounded-(--radius-base) p-3">
        <PriceRangeFilter value={priceRange} onChange={onPriceRangeChange} />
      </div>
      <div className="bg-white rounded-(--radius-base) p-3">
        <SortFilter value={sort} onChange={onSortChange} />
      </div>
      <div className="bg-white rounded-(--radius-base) p-3">
        <BrandFilter value={selectedBrands} onChange={onBrandsChange} categoryId={categoryId} />
      </div>
      <div className="bg-white rounded-(--radius-base) p-3">
        <StoreFilter value={selectedStores} onChange={onStoresChange} />
      </div>
    </FilterShell>
  )
}
