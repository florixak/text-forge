import type { LegalSection as LegalSectionType } from '@/content/legal/types'
import { cn } from '@/lib/utils'

type LegalSectionProps = {
  section: LegalSectionType
}

function LegalSection({ section }: LegalSectionProps) {
  const headingId = `${section.id}-heading`

  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className={cn(
        section.highlight &&
          'rounded-lg border border-border bg-muted/40 p-6 -mx-2 sm:mx-0',
      )}
    >
      <h2
        id={headingId}
        className="text-xl font-semibold text-foreground mb-4 scroll-mt-24"
      >
        {section.title}
      </h2>
      <div className="space-y-4 text-muted-foreground font-normal leading-relaxed">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.listItems && section.listItems.length > 0 ? (
          <ul className="list-disc list-outside pl-6 space-y-2">
            {section.listItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

export default LegalSection
