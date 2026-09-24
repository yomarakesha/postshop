import { ChevronsUpDown, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { LocalStorage } from '@/shared/lib/LocalStorage'
import { useProfileStore } from '@/shared/store/profileStore'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/utils'

interface Props {
  collapsed?: boolean
}

export const AccountDropdown = ({ collapsed }: Props) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const clearProfile = useProfileStore((s) => s.clearProfile)

  const handleLogout = () => {
    LocalStorage.delete('access_token')
    LocalStorage.delete('refresh_token')
    clearProfile()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-card transition-colors cursor-pointer outline-none',
        )}
      >
        <Avatar className="shrink-0">
          <AvatarFallback>
            {profile?.name?.[0].toUpperCase()}
            {profile?.surname?.[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'flex-1 text-left min-w-0 overflow-hidden transition-all duration-200',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <p className="text-sm font-medium truncate">
            {profile?.name} {profile?.surname}
          </p>
          <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
        </div>
        <div
          className={cn(
            'bg-card w-6 h-6 flex justify-center items-center rounded-lg border-border border shrink-0 transition-all duration-200',
            collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100',
          )}
        >
          <ChevronsUpDown size={16} className="text-muted-foreground shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align="start"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          {t('account.logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
