import { createFileRoute } from '@tanstack/react-router'
import LegalPageLayout from '@/components/legal/legal-page-layout'
import { privacyPolicy } from '@/content/legal/privacy-policy'
import { getMetadata } from '@/lib/metadata'

export const Route = createFileRoute('/privacy')({
  head: () => getMetadata('/privacy'),
  component: PrivacyPage,
})

function PrivacyPage() {
  return <LegalPageLayout document={privacyPolicy} />
}
