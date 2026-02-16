import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

import Header from '@/components/header'
import Footer from '@/components/footer'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import NotFound from '@/components/state/not-found'
import ErrorState from '@/components/state/error-state'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => {
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'keywords',
          content:
            'AI text generation, text editing, content creation, writing assistant, natural language processing, machine learning, text refinement, AI-powered writing tool',
        },
        { name: 'author', content: 'TextForge Team' },
        { name: 'theme-color', content: '#1a202c' },
        { name: 'color-scheme', content: 'light dark' },
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
      scripts: [
        {
          children: `
          (function() {
            try {
              const storedTheme = localStorage.getItem('textforge-theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : (prefersDark ? 'dark' : 'light');
              document.documentElement.classList.add(theme);
            } catch (e) {
              document.documentElement.classList.add('light');
            }
          })();
        `,
        },
      ],
    }
  },

  shellComponent: RootDocument,
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ reset }) => <ErrorState reset={reset} />,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          {children}
          <Toaster position="bottom-right" />
          <Footer />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
