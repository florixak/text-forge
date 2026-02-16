import { Link } from '@tanstack/react-router'
import { Terminal, User } from 'lucide-react'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import ThemeSwitcher from './theme-switcher'
import { NAV_LINKS } from '@/constants'

export const Header = () => {
  const { data: session } = authClient.useSession()
  return (
    <header className="bg-background text-foreground w-full shadow-md">
      <div className="flex flex-row justify-between items-center max-w-7xl w-full mx-auto py-4">
        <h1 className="ml-4 text-xl font-semibold text-foreground">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Terminal size={24} className="text-background" />
              </div>
              <span className="font-bold">TextForge</span>
            </div>
          </Link>
        </h1>
        <nav className="hidden md:block">
          <ul className="flex gap-8 flex-row items-center justify-between w-full">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-foreground hover:text-primary transition-colors"
                  activeProps={{
                    className: 'active-link',
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-row items-center gap-4">
          {!session ? (
            <Button variant="ghost" asChild>
              <Link to="/signin">
                <User className="text-foreground" />
                <span>Sign In</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
                <User className="text-foreground" />
                <span>{session.user?.name ?? session.user?.email}</span>
              </Link>
            </Button>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}

export default Header
