import { cn } from '../utils/cn'

interface Props {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return (
    <img src="/images/logo.webp" alt="logo" className={cn('w-30 h-8 object-contain', className)} />
  )
}
