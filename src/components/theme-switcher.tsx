import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()

  const handleChange = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
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
