import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/utils'

interface Props {
  icon: ReactNode
  title: string
  href: string
  collapsed?: boolean
  onNavigate?: () => void
  badge?: number
}

export const SidebarItem = ({ href, icon, title, onNavigate, collapsed, badge }: Props) => {
  const { pathname } = useLocation()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  const inner = (
    <div
      className={cn(
        'relative py-2.5 px-3 rounded-lg flex items-center text-sm transition-all duration-200 text-foreground',
        isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        collapsed ? 'justify-center gap-0' : 'gap-3',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={cn(
          'flex-1 whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200',
          collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 visible',
        )}
      >
        {title}
      </span>
      {badge != null && badge > 0 && !collapsed && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold tabular-nums text-white shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {badge != null && badge > 0 && collapsed && (
        <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
      )}
      {isActive && !collapsed && (badge == null || badge === 0) && (
        <span className="transition-opacity duration-200">
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={href} onClick={onNavigate}>
              {inner}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Link to={href} onClick={onNavigate}>
      {inner}
    </Link>
  )
}
