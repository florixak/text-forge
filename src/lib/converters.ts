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
      const output = lines
        .map((line) => line.trim().split(/\s+/).join(','))
        .join('\n')
      return { success: true, output }
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
          if (escaped.includes(',') || escaped.includes('\n')) {
            return `"${escaped}"`
          }
          return escaped
        })
        csvRows.push(values.join(','))
      })
      return { success: true, output: csvRows.join('\n') }
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      const headers = Object.keys(data)
      const values = Object.values(data)
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

export function toYAML(data: any): ConversionResult {
  try {
    // Placeholder - you'll need to install js-yaml
    // const output = yaml.dump(data)
    // return { success: true, output }

    return {
      success: false,
      error: 'YAML conversion not yet implemented. Install js-yaml library.',
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert to YAML',
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
        output += `| ${headers.map((h) => row[h] || '').join(' | ')} |\n`
      })

      return { success: true, output }
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
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

export function toHTML(data: any): ConversionResult {
  try {
    let output =
      '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Converted Data</title>\n</head>\n<body>\n'

    // Handle array of objects (convert to table)
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const headers = Object.keys(data[0])

      output += '  <table border="1">\n'
      output += '    <thead>\n      <tr>\n'
      headers.forEach((h) => {
        output += `        <th>${h}</th>\n`
      })
      output += '      </tr>\n    </thead>\n'

      output += '    <tbody>\n'
      data.forEach((row) => {
        output += '      <tr>\n'
        headers.forEach((h) => {
          output += `        <td>${row[h] || ''}</td>\n`
        })
        output += '      </tr>\n'
      })
      output += '    </tbody>\n'
      output += '  </table>\n'
    }
    // Handle object (convert to list)
    else if (typeof data === 'object' && !Array.isArray(data)) {
      output += '  <dl>\n'
      Object.entries(data).forEach(([key, value]) => {
        output += `    <dt><strong>${key}</strong></dt>\n`
        output += `    <dd>${value}</dd>\n`
      })
      output += '  </dl>\n'
    }
    // Handle primitive
    else {
      output += `  <p>${data}</p>\n`
    }

    output += '</body>\n</html>'
    return { success: true, output }
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
        return `${indent}<${nodeName}>${obj}</${nodeName}>\n`
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

  if (!parseResult.success || !parseResult.data) {
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
    case 'YAML':
      return toYAML(parseResult.data)
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
