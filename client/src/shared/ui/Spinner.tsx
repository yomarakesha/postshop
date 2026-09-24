import { cn } from '../utils/cn'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  size?: Size
  className?: string
}

const sizes: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export const Spinner = ({ size = 'md', className }: Props) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      'rounded-full border-passive1/40 border-t-blue-main animate-spin',
      sizes[size],
      className,
    )}
  />
)
