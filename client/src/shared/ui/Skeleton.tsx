import { cn } from '../utils/cn'

export const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div className={cn('animate-pulse rounded-base bg-black/10', className)} {...props} />
}
