import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/shared/store/themeStore'
import { Button } from '@/shared/ui/button'

export const ThemeSwither = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )
}
