import { NAV_LINKS } from '@/constants'
import { authClient } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { Menu, Moon, Sun, User } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const MobileMenu = () => {
  const { data: session } = authClient.useSession()
  const { theme, setTheme, mounted } = useTheme()

  const handleChange = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          {NAV_LINKS.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link
                activeProps={{ className: 'active-mobile-link' }}
                to={link.href}
              >
                {link.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          {!session ? (
            <DropdownMenuItem asChild>
              <Link to="/signin">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <User className="mr-2 h-4 w-4" />
                {session.user?.name ?? session.user?.email ?? 'Dashboard'}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleChange} disabled={!mounted}>
            {theme === 'light' ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            {theme === 'dark'
              ? 'Dark'
              : theme === 'system'
                ? 'System'
                : 'Light'}{' '}
            Mode
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileMenu
