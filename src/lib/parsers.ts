import { InputType } from '@/constants'

export interface ParseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  type: InputType
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

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim())

    // Parse data rows
    const data = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim())
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
        type: 'HTML',
      }
    }
    const parser = new DOMParser()
    const doc = parser.parseFromString(input, 'text/xml')

    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        success: false,
        error: parserError.textContent || 'Invalid XML',
        type: 'HTML', // XML not in constants, using HTML
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
      type: 'HTML', // XML not in constants, using HTML
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid XML',
      type: 'HTML',
    }
  }
}

/**
 * Parse YAML input (requires js-yaml library)
 * Note: need to install js-yaml: pnpm add js-yaml @types/js-yaml
 */
export function parseYAML(input: string): ParseResult {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input is empty',
        type: 'YAML',
      }
    }
    // const data = yaml.load(input)

    return {
      success: false,
      error: 'YAML parsing not yet implemented. Install js-yaml library.',
      type: 'YAML',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid YAML',
      type: 'YAML',
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

    lines.forEach((line) => {
      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
      if (headingMatch) {
        structure.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2],
        })
        return
      }

      // Lists
      if (/^\s*[-*+]\s/.test(line)) {
        structure.push({
          type: 'list-item',
          content: line.replace(/^\s*[-*+]\s/, ''),
        })
        return
      }

      // Code blocks
      if (line.startsWith('```')) {
        structure.push({
          type: 'code-block',
          content: line,
        })
        return
      }

      // Paragraphs
      if (line.trim()) {
        structure.push({
          type: 'paragraph',
          content: line,
        })
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

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        success: false,
        error: 'Invalid HTML',
        type: 'HTML',
      }
    }

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
      data: {
        lines: [],
        length: 0,
        wordCount: 0,
      },
      type: 'Auto-detect',
    }
  }
  return {
    success: true,
    data: {
      lines: input.split(/\r?\n/),
      length: input.length,
      wordCount: input.split(/\s+/).filter(Boolean).length,
    },
    type: 'Auto-detect',
  }
}

/**
 * Main parser function that routes to appropriate parser based on type
 */
export function parseInput(input: string, type: InputType): ParseResult {
  if (!input || !input.trim()) {
    return {
      success: false,
      error: 'Input is empty',
      type,
    }
  }

  switch (type) {
    case 'JSON':
      return parseJSON(input)
    case 'CSV':
      return parseCSV(input)
    case 'YAML':
      return parseYAML(input)
    case 'Markdown':
      return parseMarkdown(input)
    case 'HTML':
      return parseHTML(input)
    case 'Auto-detect':
      return parseText(input)
    default:
      return parseText(input)
  }
}
