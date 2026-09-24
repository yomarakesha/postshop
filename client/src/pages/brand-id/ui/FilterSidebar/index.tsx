import { FilterShell } from '../../../../widgets/Filters/FilterShell'
// Общий фильтр, как на странице категории. Своя копия здесь брала магазины из
// /shop-additionals/ — там нет признака активности, и в списке оказывались
// заблокированные магазины и магазин без названия пустой строкой.
import { StoreFilter } from '../../../../widgets/Filters/StoreFilter'
import { SortFilter } from './SortFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import type { SortOption } from './SortFilter'
import type { PriceRange } from './PriceRangeFilter'

interface FilterSidebarProps {
  brandImage?: string
  sort?: SortOption
  onSortChange: (value: SortOption | undefined) => void
  priceRange: PriceRange
  onPriceRangeChange: (value: PriceRange) => void
  selectedStores: Array<number>
  onStoresChange: (value: Array<number>) => void
}

export const FilterSidebar = ({
  brandImage,
  sort,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  selectedStores,
  onStoresChange,
}: FilterSidebarProps) => {
  const content = (
    <>
      {brandImage && (
        <img src={brandImage} className="mx-auto my-4 w-full max-w-25 h-auto object-contain" />
      )}
      <div className="bg-white rounded-base p-3">
        <PriceRangeFilter value={priceRange} onChange={onPriceRangeChange} />
      </div>
      <div className="bg-white rounded-base p-3">
        <SortFilter value={sort} onChange={onSortChange} />
      </div>
      <div className="bg-white rounded-base p-3">
        <StoreFilter value={selectedStores} onChange={onStoresChange} />
      </div>
    </>
  )

  return (
    <FilterShell sidebarVisibility="min-[1150px]:flex" toggleVisibility="min-[1150px]:hidden">
      {content}
    </FilterShell>
  )
}
