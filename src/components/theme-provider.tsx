import { isValidTheme } from '@/lib/utils'
import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  mounted: false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'textforge-theme',
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem(storageKey)
    if (isValidTheme(storedTheme ?? '')) {
      setTheme(storedTheme as Theme)
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const applyTheme = (resolvedTheme: 'dark' | 'light') => {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      handleChange(mediaQuery)
      mediaQuery.addEventListener('change', handleChange)
      localStorage.setItem(storageKey, theme)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(theme)
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey, mounted])

  const value = {
    theme,
    setTheme,
    mounted,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
