import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

const ThemeSwitcher = () => {
  const { theme, setTheme, mounted } = useTheme()

  const handleChange = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
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
    <Button
      variant="ghost"
      onClick={handleChange}
      title="Toggle Theme"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Sun /> : theme === 'dark' ? <Moon /> : <Laptop />}
    </Button>
  )
}

export default ThemeSwitcher
