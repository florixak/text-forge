import { InputType } from '@/constants'
import { parseInput } from './parsers'

export interface ConversionResult {
  success: boolean
  output?: string
  error?: string
}

export function toJSON(data: any): ConversionResult {
  try {
    const output = JSON.stringify(data, null, 2)
    return { success: true, output }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert to JSON',
    }
  }
}

export function toCSV(data: any): ConversionResult {
  try {
    if (typeof data === 'string') {
      const lines = data.split(/\r?\n/).filter((line) => line.trim())

      if (lines.length === 0) {
        return { success: false, error: 'No data to convert' }
      }

      const firstLine = lines[0]
      const hasMultipleSpaces = /\s{2,}/.test(firstLine)
      const hasTabs = firstLine.includes('\t')

      let delimiter: RegExp
      if (hasTabs) {
        delimiter = /\t+/
      } else if (hasMultipleSpaces) {
        delimiter = /\s{2,}/
      } else {
        delimiter = /\s+/
      }

      const csvRows = lines.map((line) => {
        const values = line
          .trim()
          .split(delimiter)
          .map((v) => {
            const trimmed = v.trim()
            const needsQuotes =
              trimmed.includes(',') ||
              trimmed.includes(' ') ||
              trimmed.includes('\n') ||
              trimmed.includes('"')
            const escaped = trimmed.replace(/"/g, '""')
            return needsQuotes ? `"${escaped}"` : escaped
          })
        return values.join(',')
      })

      return { success: true, output: csvRows.join('\n') }
    }

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0])
      const csvRows = []
      csvRows.push(headers.join(','))

      data.forEach((row: Record<string, any>) => {
        const values = headers.map((h) => {
          const val = row[h] !== undefined ? row[h] : ''
          const escaped =
            typeof val === 'string' ? val.replace(/"/g, '""') : String(val)
          if (
            escaped.includes(',') ||
            escaped.includes('\n') ||
            escaped.includes('"')
          ) {
            return `"${escaped}"`
          }
          return escaped
        })
        csvRows.push(values.join(','))
      })
      return { success: true, output: csvRows.join('\n') }
    }

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      const headers = Object.keys(data)
      const values = headers.map((h) => {
        const val = data[h]
        const escaped =
          typeof val === 'string' ? val.replace(/"/g, '""') : String(val)
        if (
          escaped.includes(',') ||
          escaped.includes('\n') ||
          escaped.includes('"')
        ) {
          return `"${escaped}"`
        }
        return escaped
      })
      return {
        success: true,
        output: `${headers.join(',')}\n${values.join(',')}`,
      }
    }

    return {
      success: false,
      error:
        'Data must be an array of objects or a single object to convert to CSV',
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert to CSV',
    }
  }
}

export function toMarkdown(data: any): ConversionResult {
  try {
    let output = ''

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0])

      output += `| ${headers.join(' | ')} |\n`
      output += `| ${headers.map(() => '---').join(' | ')} |\n`

      data.forEach((row) => {
        output += `| ${headers.map((h) => row[h] ?? '').join(' | ')} |\n`
      })

      return { success: true, output }
    }

    if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        output += `- **${key}**: ${value}\n`
      })
      return { success: true, output }
    }

    return { success: true, output: String(data) }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to convert to Markdown',
    }
  }
}

function escapeInput(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function toHTML(data: any): ConversionResult {
  try {
    const parts: string[] = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <title>Converted Data</title>',
      '</head>',
      '<body>',
    ]

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0])

      parts.push('  <table border="1">')
      parts.push('    <thead>')
      parts.push('      <tr>')
      headers.forEach((h) => {
        parts.push(`        <th>${escapeInput(String(h))}</th>`)
      })
      parts.push('      </tr>')
      parts.push('    </thead>')

      parts.push('    <tbody>')
      data.forEach((row) => {
        parts.push('      <tr>')
        headers.forEach((h) => {
          parts.push(`        <td>${escapeInput(String(row[h] ?? ''))}</td>`)
        })
        parts.push('      </tr>')
      })
      parts.push('    </tbody>')
      parts.push('  </table>')
    } else if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null
    ) {
      parts.push('  <dl>')
      Object.entries(data).forEach(([key, value]) => {
        parts.push(`    <dt><strong>${escapeInput(String(key))}</strong></dt>`)
        parts.push(`    <dd>${escapeInput(String(value))}</dd>`)
      })
      parts.push('  </dl>')
    } else {
      parts.push(`  <p>${escapeInput(String(data))}</p>`)
    }

    parts.push('</body>')
    parts.push('</html>')

    return { success: true, output: parts.join('\n') }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert to HTML',
    }
  }
}

export function toXML(data: any, rootName = 'root'): ConversionResult {
  try {
    const objectToXML = (obj: any, nodeName: string, indent = ''): string => {
      if (obj === null || obj === undefined) {
        return `${indent}<${nodeName}/>\n`
      }

      if (typeof obj !== 'object') {
        return `${indent}<${nodeName}>${escapeInput(String(obj))}</${nodeName}>\n`
      }

      if (Array.isArray(obj)) {
        let xml = ''
        obj.forEach((item, index) => {
          xml += objectToXML(item, `${nodeName}_${index}`, indent)
        })
        return xml
      }

      let xml = `${indent}<${nodeName}>\n`
      Object.entries(obj).forEach(([key, value]) => {
        xml += objectToXML(value, key, indent + '  ')
      })
      xml += `${indent}</${nodeName}>\n`
      return xml
    }

    const output = `<?xml version="1.0" encoding="UTF-8"?>\n${objectToXML(data, rootName, '')}`
    return { success: true, output }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert to XML',
    }
  }
}

export function convertData(
  input: string,
  fromType: InputType,
  toType: InputType,
): ConversionResult {
  const parseResult = parseInput(input, fromType)

  if (!parseResult.success || typeof parseResult.data === 'undefined') {
    return {
      success: false,
      error: parseResult.error || 'Failed to parse input',
    }
  }

  switch (toType) {
    case 'JSON':
      return toJSON(parseResult.data)
    case 'CSV':
      return toCSV(parseResult.data)
    case 'Markdown':
      return toMarkdown(parseResult.data)
    case 'HTML':
      return toHTML(parseResult.data)
    case 'XML':
      return toXML(parseResult.data)
    case 'Text':
      if (typeof parseResult.data === 'string') {
        return { success: true, output: parseResult.data }
      }
      return {
        success: true,
        output: JSON.stringify(parseResult.data, null, 2),
      }
    default:
      return {
        success: false,
        error: `Unsupported output format: ${toType}`,
      }
  }
}
