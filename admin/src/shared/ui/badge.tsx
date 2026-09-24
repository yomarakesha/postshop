import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/utils'

const variants = {
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  destructive: 'bg-red-500/10 text-red-600 dark:text-red-400',
  warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  default: 'bg-muted text-muted-foreground',
} as const

interface BadgeProps extends PropsWithChildren {
  variant?: keyof typeof variants
  className?: string
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
