import { cn } from '#/shared/utils/cn'

interface Props {
  selected?: boolean
  className?: string
}

export const RadioCircle = ({ selected, className }: Props) => {
  return (
    <div
      className={cn(
        'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
        selected ? 'border-blue-main' : 'border-passive1',
        className,
      )}
    >
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-main" />}
    </div>
  )
}
