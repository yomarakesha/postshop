import { Link } from '@tanstack/react-router'

interface SearchSectionItem {
  id: number
  name: string
}

interface SearchSectionProps {
  title: string
  items: Array<SearchSectionItem>
  viewAllTo: string
  viewAllSearch?: Record<string, unknown>
  getItemTo: (id: number) => { to: string; params?: Record<string, string> }
  onClose: () => void
  viewAllLabel: string
}

export const SearchSection = ({
  title,
  items,
  viewAllTo,
  viewAllSearch,
  getItemTo,
  onClose,
  viewAllLabel,
}: SearchSectionProps) => {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5">
      <p className="p3 font-semibold">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item) => {
          const { to, params } = getItemTo(item.id)
          return (
            <Link
              key={item.id}
              to={to}
              params={params}
              className="t2 font-medium text-text bg-gray2 rounded-base px-4 py-2 truncate max-w-56 transition-colors"
              onClick={onClose}
            >
              {item.name}
            </Link>
          )
        })}
        <Link
          to={viewAllTo}
          search={viewAllSearch}
          className="t2 font-medium text-blue-main hover:underline px-4 py-2"
          onClick={onClose}
        >
          {viewAllLabel}
        </Link>
      </div>
    </div>
  )
}
