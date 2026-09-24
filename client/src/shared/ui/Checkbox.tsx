import { cn } from '#/shared/utils/cn'
import CheckIcon from '#/shared/assets/icons/check.svg?react'

interface Props {
  checked?: boolean
  className?: string
}

export const Checkbox = ({ checked, className }: Props) => {
  return (
    <div
      className={cn(
        'w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-colors',
        checked ? 'bg-blue-main' : 'border-2 border-stroke',
        className,
      )}
    >
      {checked && <CheckIcon className="w-3 h-3 text-white" />}
    </div>
  )
}
