interface Props {
  value: string
  onChange: (value: string) => void
  length?: number
  autoFocus?: boolean
  /** Подсказка в пустом поле: без неё поле выглядит как пустое место. */
  placeholder?: string
}

export const OtpInput = ({ value, onChange, length = 6, autoFocus, placeholder }: Props) => {
  return (
    <input
      type="tel"
      inputMode="numeric"
      value={value}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, length)
        onChange(raw)
      }}
      className="h2 w-full font-medium bg-transparent outline-none text-center placeholder:text-passive1"
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  )
}
