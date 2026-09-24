import { cn } from '../utils/cn'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
}

export const Input = ({ className, label, required, ...rest }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="p3 font-medium">
          {label} {required && <span className="text-failure">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full p3 px-3 py-2.5 border border-border rounded-base focus:border-blue-main placeholder:text-passive1',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
