import { COUNTRY_CODE } from '#/shared/constants/locale'

interface Props {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  let formatted = ''
  if (digits.length > 0) formatted += digits.slice(0, 2)
  if (digits.length > 2) formatted = `${formatted} ${digits.slice(2, 4)}`
  if (digits.length > 4) formatted += ` ${digits.slice(4, 6)}`
  if (digits.length > 6) formatted += ` ${digits.slice(6, 8)}`
  return formatted
}

export const PhoneInput = ({ value, onChange, autoFocus }: Props) => {
  return (
    <div className="w-full flex items-center justify-center">
      <h3 className="h2 font-medium pr-2">{COUNTRY_CODE}</h3>
      <input
        type="tel"
        value={formatPhone(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
          onChange(raw)
        }}
        placeholder="XX XX XX XX"
        className="h2 font-medium bg-transparent outline-none placeholder:text-passive1 w-[11ch] shrink-0"
        autoFocus={autoFocus}
      />
    </div>
  )
}
