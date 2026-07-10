import { createFileRoute } from '@tanstack/react-router'
import LegalPageLayout from '@/components/legal/legal-page-layout'
import { termsOfService } from '@/content/legal/terms-of-service'
import { getMetadata } from '@/lib/metadata'

export const Route = createFileRoute('/terms')({
  head: () => getMetadata('/terms'),
  component: TermsPage,
})

function TermsPage() {
  return <LegalPageLayout document={termsOfService} />
}
