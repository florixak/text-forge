import { Link } from '@tanstack/react-router'

const linkClassName =
  'underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex flex-col items-center gap-3 py-4 px-4">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
        >
          <Link to="/privacy" className={linkClassName}>
            Privacy Policy
          </Link>
          <Link to="/terms" className={linkClassName}>
            Terms of Service
          </Link>
        </nav>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Text Forge. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
