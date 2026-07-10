import { Link } from '@tanstack/react-router'
import type { LegalDocument } from '@/content/legal/types'
import LegalSection from '@/components/legal/legal-section'

type LegalPageLayoutProps = {
  document: LegalDocument
}

const linkClassName =
  'underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

function LegalPageLayout({ document }: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-background py-10 px-4 mt-10">
      <a
        href="#legal-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-md"
      >
        Skip to content
      </a>

      <article className="max-w-3xl mx-auto space-y-10">
        <header className="text-center space-y-2 border-b border-border pb-8">
          <h1 className="text-3xl font-bold text-foreground">{document.title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {document.lastUpdated}
          </p>
        </header>

        <nav aria-label="Table of contents" className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Contents
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className={linkClassName}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div id="legal-content" className="space-y-10">
          {document.sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>

        <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            See also:{' '}
            {document.title === 'Privacy Policy' ? (
              <Link to="/terms" className={linkClassName}>
                Terms of Service
              </Link>
            ) : (
              <Link to="/privacy" className={linkClassName}>
                Privacy Policy
              </Link>
            )}
          </p>
        </footer>
      </article>
    </main>
  )
}

export default LegalPageLayout
