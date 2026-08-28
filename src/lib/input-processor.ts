import { InputFormat, OutputFormat } from '@/types'

interface ProcessingOptions {
  maxLength: number
  targetFormat: OutputFormat
}

interface ProcessedInput {
  content: string
  originalLength: number
  processedLength: number
  compressionRatio: number
  metadata: {
    isCompressed: boolean
    strategy: string
    lineCount?: number
    sampleInfo?: string
  }
}

const formatProcessors = {
  JSON: (input: string, options: ProcessingOptions): ProcessedInput => {
    let content = input

    try {
      const parsed = JSON.parse(input)
      content = JSON.stringify(parsed)
    } catch {
      content = input.replace(/\s+/g, ' ').trim()
    }

    if (content.length > options.maxLength) {
      content = sampleJSON(content, options.maxLength)
    }

    return {
      content,
      originalLength: input.length,
      processedLength: content.length,
      compressionRatio: input.length > 0 ? content.length / input.length : 0,
      metadata: {
        isCompressed: content.length < input.length,
        strategy: 'JSON normalization + structural sampling',
      },
    }
  },
  CSV: (input: string, options: ProcessingOptions): ProcessedInput => {
    const lines = input.split('\n').filter((line) => line.trim())
    const header = lines[0] || ''
    const dataLines = lines.slice(1)

    if (input.length <= options.maxLength) {
      return {
        content: input,
        originalLength: input.length,
        processedLength: input.length,
        compressionRatio: 1,
        metadata: {
          isCompressed: false,
          strategy: 'None',
        },
      }
    }

    const sampleSize = Math.min(
      dataLines.length,
      Math.max(
        5,
        Math.ceil((options.maxLength / input.length) * dataLines.length),
      ),
    )

    const step = Math.max(1, Math.floor(dataLines.length / sampleSize))

    const sampledLines = [
      header,
      ...dataLines.filter((_, i) => i % step === 0).slice(0, sampleSize),
    ]

    const content = sampledLines.join('\n')

    const finalContent =
      content.length > options.maxLength
        ? content.substring(0, options.maxLength - 3) + '...'
        : content

    return {
      content: finalContent,
      originalLength: input.length,
      processedLength: finalContent.length,
      compressionRatio:
        input.length > 0 ? finalContent.length / input.length : 0,
      metadata: {
        isCompressed: true,
        strategy: `CSV row sampling (kept ${sampledLines.length}/${lines.length} rows)`,
        lineCount: lines.length,
        sampleInfo: `${sampleSize} sample rows at intervals of ${step}`,
      },
    }
  },
  Text: (input: string, options: ProcessingOptions): ProcessedInput => {
    let content = input
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n')

    if (content.length > options.maxLength) {
      content = sampleText(content, options.maxLength)
    }

    return {
      content,
      originalLength: input.length,
      processedLength: content.length,
      compressionRatio: input.length > 0 ? content.length / input.length : 0,
      metadata: {
        isCompressed: content.length < input.length,
        strategy: 'whitespace normalization + smart paragraph sampling',
      },
    }
  },
  DEFAULT: (input: string, options: ProcessingOptions): ProcessedInput => {
    let content = input.replace(/\s{2,}/g, ' ').trim()

    if (content.length > options.maxLength) {
      content = truncateWithContext(content, options.maxLength)
    }

    return {
      content,
      originalLength: input.length,
      processedLength: content.length,
      compressionRatio: input.length > 0 ? content.length / input.length : 0,
      metadata: {
        isCompressed: content.length < input.length,
        strategy: 'whitespace normalization',
      },
    }
  },
}

function sampleJSON(json: string, maxLength: number): string {
  try {
    const parsed = JSON.parse(json)

    if (Array.isArray(parsed)) {
      const sampleSize = Math.max(1, Math.floor(parsed.length * 0.25))
      const step = Math.max(1, Math.floor(parsed.length / sampleSize))
      const sampled = parsed.filter((_, i) => i % step === 0)

      const result = JSON.stringify(sampled)
      if (result.length <= maxLength) return result
    }

    const str = JSON.stringify(parsed)
    if (str.length <= maxLength) return str

    const isArray = Array.isArray(parsed)
    const closingChar = isArray ? ']' : '}'
    const indicator = ' ...'
    const reservedLength = closingChar.length + indicator.length

    let left = 1
    let right = maxLength - reservedLength
    let bestLen = 0

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const candidate = str.substring(0, mid) + closingChar

      try {
        JSON.parse(candidate)
        bestLen = mid
        left = mid + 1
      } catch {
        right = mid - 1
      }
    }

    if (bestLen === 0) {
      return isArray ? '[]' : '{}'
    }

    return str.substring(0, bestLen) + closingChar + indicator
  } catch {
    return truncateWithContext(json, maxLength)
  }
}

function sampleText(text: string, maxLength: number): string {
  const sections = text.split('\n\n')

  if (sections.length <= 1) {
    return truncateWithContext(text, maxLength)
  }

  const startChars = Math.floor(maxLength * 0.3)
  const endChars = Math.floor(maxLength * 0.2)
  const middleChars = Math.max(0, maxLength - startChars - endChars - 50)

  const start = sections[0]?.substring(0, startChars) || ''
  const middle =
    middleChars > 0
      ? sections[Math.floor(sections.length / 2)]?.substring(0, middleChars) ||
        ''
      : ''
  const end = sections[sections.length - 1]?.slice(-endChars) || ''

  return `${start}\n\n[... sampled ...]\n\n${middle}\n\n[... continued to end ...]\n\n${end}`
}

function truncateWithContext(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength - 10)
  const lastSpace = truncated.lastIndexOf(' ')
  const lastNewline = truncated.lastIndexOf('\n')
  const cutPoint = Math.max(lastSpace, lastNewline)

  return cutPoint > 0
    ? truncated.substring(0, cutPoint) + '...'
    : truncated + '...'
}

export const processInput = (
  input: string,
  format: InputFormat,
  maxLength: number,
  targetFormat: OutputFormat,
): ProcessedInput => {
  if (!input || input.trim().length === 0) {
    return {
      content: '',
      originalLength: input.length,
      processedLength: 0,
      compressionRatio: 0,
      metadata: {
        isCompressed: false,
        strategy: 'empty-input',
      },
    }
  }

  const processor =
    formatProcessors[format as keyof typeof formatProcessors] ||
    formatProcessors.DEFAULT

  return processor(input, { maxLength, targetFormat })
}

export type { ProcessedInput, ProcessingOptions }
export { formatProcessors }
