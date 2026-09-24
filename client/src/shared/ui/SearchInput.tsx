import SearchIcon from '#/shared/assets/icons/search.svg?react'

interface SearchInputProps {
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SearchInput = ({ placeholder, value, onChange }: SearchInputProps) => {
  return (
    <div className="flex items-center gap-2 rounded-(--radius-base) bg-gray2 py-2 px-3">
      <SearchIcon />
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent p3 outline-none placeholder:text-passive1"
      />
    </div>
  )
}
