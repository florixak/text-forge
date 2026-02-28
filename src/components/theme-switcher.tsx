import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const ThemeSwitcher = () => {
  const { theme, setTheme, mounted } = useTheme()

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        title="Toggle Theme"
        aria-label="Toggle Theme"
        disabled
      >
        <div className="size-6" /> {/* Placeholder to maintain layout */}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Sun />
            ) : theme === 'dark' ? (
              <Moon />
            ) : (
              <Laptop />
            )}
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Laptop />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeSwitcher
