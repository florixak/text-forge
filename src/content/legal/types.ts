export type LegalSection = {
  id: string
  title: string
  paragraphs: Array<string>
  listItems?: Array<string>
  highlight?: boolean
}

export type LegalDocument = {
  title: string
  lastUpdated: string
  sections: Array<LegalSection>
}
