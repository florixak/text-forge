import { OutputFormat } from '@/types'

const getFileExtension = (type: OutputFormat): string => {
  switch (type) {
    case 'JSON':
      return 'json'
    case 'CSV':
      return 'csv'
    case 'YAML':
      return 'yaml'
    case 'XML':
      return 'xml'
    case 'Markdown':
      return 'md'
    case 'HTML':
      return 'html'
    default:
      return 'txt'
  }
}

const getMimeType = (type: OutputFormat): string => {
  switch (type) {
    case 'JSON':
      return 'application/json'
    case 'CSV':
      return 'text/csv'
    case 'YAML':
      return 'text/yaml'
    case 'XML':
      return 'application/xml'
    case 'Markdown':
      return 'text/markdown'
    case 'HTML':
      return 'text/html'
    default:
      return 'text/plain'
  }
}

export const downloadFile = (
  content: string,
  type: OutputFormat,
  filename?: string,
): boolean => {
  if (content.length === 0) return false

  const extension = getFileExtension(type)
  const mimeType = getMimeType(type)
  const defaultFilename = filename || `converted-${Date.now()}.${extension}`

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = defaultFilename
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
