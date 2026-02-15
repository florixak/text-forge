import LoadingIndicator from '@/components/state/loading-indicator'
import { SignUpForm } from '@/components/signup-form'
import { guestMiddleware } from '@/lib/middleware'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
  pendingComponent: () => <LoadingIndicator />,
  head: () => {
    const baseUrl = new URL(
      process.env.VITE_BASE_URL || 'http://localhost:3000',
    )
    const canonicalUrl = new URL('/signup', baseUrl).toString()
    const ogImageUrl = new URL('/og-image.png', baseUrl).toString()

    const appTitle = 'Sign Up - TextForge'
    const appDescription =
      'Create a TextForge account to unlock powerful AI text generation and editing features. Sign up now to start creating, refining, and enhancing your written content with ease.'

    return {
      meta: [
        {
          title: appTitle,
        },
        {
          name: 'description',
          content: appDescription,
        },
        { property: 'og:title', content: appTitle },
        {
          property: 'og:description',
          content: appDescription,
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: ogImageUrl },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: appTitle },
        {
          name: 'twitter:description',
          content: appDescription,
        },
        { name: 'twitter:image', content: ogImageUrl },

        { name: 'robots', content: 'index, follow' },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
    }
  },
})

function RouteComponent() {
  return (
    <section className="min-h-screen bg-background flex items-center justify-center max-w-md mx-auto p-4">
      <SignUpForm />
    </section>
  )
}
