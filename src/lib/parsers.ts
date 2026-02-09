import { InputFormat } from '@/types'

export interface ParseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  type: InputFormat
}

/**
 * Parse JSON input
 */
export function parseJSON(input: string): ParseResult {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'JSON',
      }
    }
    const data = JSON.parse(input)
    return {
      success: true,
      data,
      type: 'JSON',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
      type: 'JSON',
    }
  }
}

/**
 * Parse CSV input into array of objects
 */
export function parseCSV(input: string): ParseResult<Record<string, string>[]> {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'CSV',
      }
    }

    const lines = input.trim().split(/\r?\n/)
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV requires at least a header row and one data row',
        type: 'CSV',
      }
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
      result.push(current)
      return result
    }

    const headers = parseCSVLine(lines[0])

    const data = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = parseCSVLine(line)
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

    return {
      success: true,
      data,
      type: 'CSV',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid CSV',
      type: 'CSV',
    }
  }
}

/**
 * Parse XML input (basic parsing, returns DOM-like structure)
 */
export function parseXML(input: string): ParseResult {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'XML',
      }
    }
    const parser = new DOMParser()
    const doc = parser.parseFromString(input, 'text/xml')

    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        success: false,
        error: parserError.textContent || 'Invalid XML',
        type: 'XML',
      }
    }

    const xmlToObject = (node: Element): any => {
      const obj: any = {}

      if (node.attributes.length > 0) {
        obj['@attributes'] = {}
        Array.from(node.attributes).forEach((attr) => {
          obj['@attributes'][attr.name] = attr.value
        })
      }

      const children = Array.from(node.children)
      if (children.length === 0) {
        return node.textContent?.trim() || ''
      }

      children.forEach((child) => {
        const childName = child.tagName
        const childValue = xmlToObject(child)

        if (obj[childName]) {
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]]
          }
          obj[childName].push(childValue)
        } else {
          obj[childName] = childValue
        }
      })

      return obj
    }

    const data = xmlToObject(doc.documentElement)

    return {
      success: true,
      data: {
        [doc.documentElement.tagName]: data,
      },
      type: 'XML',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid XML',
      type: 'XML',
    }
  }
}

/**
 * Parse Markdown input (basic parsing, returns structured content)
 */
export function parseMarkdown(input: string): ParseResult {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'Markdown',
      }
    }
    const lines = input.split(/\r?\n/)
    const structure: Array<{
      type: string
      content: string
      level?: number
    }> = []

    let inCodeBlock = false

    lines.forEach((line) => {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        structure.push({
          type: inCodeBlock ? 'code-block-start' : 'code-block-end',
          content: line,
        })
        return
      }
    })

    return {
      success: true,
      data: structure,
      type: 'Markdown',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid Markdown',
      type: 'Markdown',
    }
  }
}

/**
 * Parse HTML input
 */
export function parseHTML(input: string): ParseResult {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'HTML',
      }
    }
    const parser = new DOMParser()
    const doc = parser.parseFromString(input, 'text/html')

    // Return a simplified structure
    const data = {
      title: doc.title || '',
      body: doc.body?.innerHTML || '',
      head: doc.head?.innerHTML || '',
    }

    return {
      success: true,
      data,
      type: 'HTML',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid HTML',
      type: 'HTML',
    }
  }
}

/**
 * Parse plain text (no special formatting)
 */
export function parseText(input: string): ParseResult {
  if (!input) {
    return {
      success: true,
      data: '',
      type: 'Text',
    }
  }
  return {
    success: true,
    data: input,
    type: 'Text',
  }
}

/**
 * Auto-detect input type based on content
 */
export function detectInputType(input: string): InputFormat {
  const trimmed = input.trim()

  // Try JSON
  try {
    JSON.parse(trimmed)
    return 'JSON'
  } catch {}

  // Check for XML (starts with <?xml or has root element)
  if (trimmed.startsWith('<?xml') || /^<\w+[^>]*>/.test(trimmed)) {
    return 'XML'
  }

  // Check for HTML (doctype or common html tags)
  if (
    /^<!DOCTYPE\s+html/i.test(trimmed) ||
    /<html[^>]*>/i.test(trimmed) ||
    /<head[^>]*>/i.test(trimmed) ||
    /<body[^>]*>/i.test(trimmed)
  ) {
    return 'HTML'
  }

  // Check for CSV (has header row with commas)
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length >= 2) {
    const firstLine = lines[0]
    const hasCommas = firstLine.includes(',')
    const secondLine = lines[1]
    const sameColumns =
      firstLine.split(',').length === secondLine.split(',').length

    if (hasCommas && sameColumns) {
      return 'CSV'
    }
  }

  // Check for Markdown (headings, lists, code blocks)
  if (
    /^#{1,6}\s/m.test(trimmed) ||
    /^\s*[-*+]\s/m.test(trimmed) ||
    /^\d+\.\s/m.test(trimmed) ||
    /^```/m.test(trimmed)
  ) {
    return 'Markdown'
  }

  // Default to Text
  return 'Text'
}

/**
 * Main parser function that routes to appropriate parser based on type
 */
export function parseInput(input: string, type: InputFormat): ParseResult {
  if (!input || !input.trim()) {
    return {
      success: false,
      error: 'Input is empty',
      type,
    }
  }

  // Auto-detect if needed
  let actualType = type
  if (type === 'Auto-detect') {
    actualType = detectInputType(input)
  }

  switch (actualType) {
    case 'JSON':
      return parseJSON(input)
    case 'CSV':
      return parseCSV(input)
    case 'Markdown':
      return parseMarkdown(input)
    case 'HTML':
      return parseHTML(input)
    case 'XML':
      return parseXML(input)
    case 'Text':
      return parseText(input)
    default:
      return parseText(input)
  }
}
