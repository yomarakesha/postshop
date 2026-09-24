import { cn } from '../utils/cn'
import { Input } from './Input'
import type { InputProps } from './Input'
import { COUNTRY_CODE } from '#/shared/constants/locale'

export const PhoneNumberInput = ({ className, ...rest }: InputProps) => {
  return (
    <div className="relative">
      <p className="absolute bottom-2.75 left-3 text-passive2">{COUNTRY_CODE}</p>
      <Input maxLength={8} className={cn('indent-11.5', className)} type="tel" {...rest} />
    </div>
  )
}
