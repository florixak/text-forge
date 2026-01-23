import { navLinks } from '@/constants'
import { Link } from '@tanstack/react-router'
import { Terminal } from 'lucide-react'
import { Button } from './ui/button'

export default function Header() {
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
        <nav>
          <ul className="flex gap-8 flex-row items-center justify-between w-full">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Button asChild>
          <Link to="/signin">Sign In</Link>
        </Button>
      </div>
    </header>
  )
}
