import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/utils'

interface Props extends PropsWithChildren {
  title: string
  collapsed?: boolean
}

export const SidebarSection = ({ title, children, collapsed }: Props) => {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          collapsed ? 'h-0 opacity-0' : 'h-auto opacity-100',
        )}
      >
        <p className="px-3 text-[11px] font-medium text-foreground/40 uppercase tracking-wider whitespace-nowrap">
          {title}
        </p>
      </div>
      {collapsed && <div className="mx-auto w-6 border-t border-border" />}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
