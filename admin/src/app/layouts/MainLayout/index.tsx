import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useSidebarStore } from '@/shared/store/sidebarStore'

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_COLLAPSED_WIDTH = 68
export const HEADER_HEIGHT = 60

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        headerHeight={HEADER_HEIGHT}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className="bg-body-background m-2 rounded-2xl flex-1 min-w-0 h-[calc(100dvh-16px)] border border-border lg:ml-(--sidebar-w) ml-2 overflow-hidden flex flex-col"
        style={
          {
            '--sidebar-w': `${collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
            transition: 'margin-left 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          } as React.CSSProperties
        }
      >
        <Header height={HEADER_HEIGHT} onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-2 lg:p-4 overflow-auto flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
