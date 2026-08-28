import { describe, expect, it } from 'vitest'
import { processInput } from './input-processor'

describe('input-processor', () => {
  describe('processInput', () => {
    describe('empty input', () => {
      it('should return empty output', () => {
        const input = ''
        const format = 'Text'
        const maxLength = 10
        const targetFormat = 'Text'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('')
        expect(output.originalLength).toBe(0)
        expect(output.processedLength).toBe(0)
        expect(output.compressionRatio).toBe(0)
        expect(output.metadata.isCompressed).toBe(false)
        expect(output.metadata.strategy).toBe('empty-input')
      })
      it('should return empty output when input is whitespace-only', () => {
        const input = '   \n\t'
        const format = 'Text'
        const maxLength = 10
        const targetFormat = 'Text'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('')
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(0)
        expect(output.compressionRatio).toBe(0)
        expect(output.metadata.isCompressed).toBe(false)
        expect(output.metadata.strategy).toBe('empty-input')
      })
    })
    describe('JSON', () => {
      it('should minify valid JSON that fits in maxLength', () => {
        const input = '{\n "a": 1\n}'
        const format = 'JSON'
        const maxLength = 1000
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('{"a":1}')
        expect(() => JSON.parse(output.content)).not.toThrow()
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThan(input.length)
        expect(output.metadata.strategy).toBe(
          'JSON normalization + structural sampling',
        )
      })

      it('should sample a large JSON array and keep it valid', () => {
        const input = JSON.stringify(
          Array.from({ length: 50 }, (_, i) => ({ i })),
        )
        const format = 'JSON'
        const maxLength = 120
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        const parsed = JSON.parse(output.content)
        expect(Array.isArray(parsed)).toBe(true)
        expect(parsed.length).toBeLessThan(50)
        expect(parsed.length).toBeGreaterThan(0)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.originalLength).toBe(input.length)
        expect(output.metadata.isCompressed).toBe(true)
      })

      it('should collapse whitespace when JSON is invalid', () => {
        const input = '{not json   but   spaced}'
        const format = 'JSON'
        const maxLength = 1000
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('{not json but spaced}')
        expect(() => JSON.parse(output.content)).toThrow()
        expect(output.processedLength).toBeLessThan(input.length)
      })

      it('should fit oversize invalid JSON into maxLength', () => {
        const input = '{not json ' + 'word '.repeat(40) + '}'
        const format = 'JSON'
        const maxLength = 30
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(() => JSON.parse(output.content)).toThrow()
        expect(output.content.endsWith('...')).toBe(true)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.metadata.isCompressed).toBe(true)
      })
    })
    describe('CSV', () => {
      it('should return the original input when it fits', () => {
        const input = 'h1,h2\n1,a\n2,b'
        const format = 'CSV'
        const maxLength = 1000
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe(input)
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(input.length)
        expect(output.compressionRatio).toBe(1)
        expect(output.metadata.isCompressed).toBe(false)
        expect(output.metadata.strategy).toBe('None')
      })

      it('should keep the header and drop rows when over maxLength', () => {
        const rows = [
          'h1,h2',
          ...Array.from({ length: 40 }, (_, i) => `${i},x`),
        ]
        const input = rows.join('\n')
        const format = 'CSV'
        const maxLength = 50
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content.startsWith('h1,h2')).toBe(true)
        expect(output.content.split('\n').length).toBeLessThan(rows.length)
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.metadata.isCompressed).toBe(true)
      })

      it('should set sampling metadata when compressing', () => {
        const rows = [
          'h1,h2',
          ...Array.from({ length: 40 }, (_, i) => `${i},x`),
        ]
        const input = rows.join('\n')
        const format = 'CSV'
        const maxLength = 50
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.metadata.lineCount).toBe(rows.length)
        expect(output.metadata.strategy).toMatch(/CSV row sampling/)
        expect(output.metadata.sampleInfo).toMatch(/intervals of/)
      })
    })
    describe('Text', () => {
      it('should strip blank lines when the text fits', () => {
        const input = 'a\n\n  b  \n\n'
        const format = 'Text'
        const maxLength = 1000
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('a\nb')
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.metadata.strategy).toBe(
          'whitespace normalization + smart paragraph sampling',
        )
      })

      it('should truncate multi-paragraph text after stripping blank lines', () => {
        const input = `${'A'.repeat(40)}\n\n${'B'.repeat(40)}\n\n${'C'.repeat(40)}`
        const format = 'Text'
        const maxLength = 40
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).not.toContain('[... sampled ...]')
        expect(output.content.endsWith('...')).toBe(true)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.metadata.isCompressed).toBe(true)
      })

      it('should truncate a single paragraph over maxLength', () => {
        const input = 'word '.repeat(30).trim()
        const format = 'Text'
        const maxLength = 20
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content.endsWith('...')).toBe(true)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.metadata.isCompressed).toBe(true)
      })
    })
    describe('other formats (DEFAULT)', () => {
      it('should collapse extra whitespace when the input fits', () => {
        const input = '<p>Hello    world</p>'
        const format = 'HTML'
        const maxLength = 1000
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content).toBe('<p>Hello world</p>')
        expect(output.originalLength).toBe(input.length)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.metadata.strategy).toBe('whitespace normalization')
      })

      it('should truncate when over maxLength', () => {
        const input = '<p>' + 'word '.repeat(40) + '</p>'
        const format = 'HTML'
        const maxLength = 30
        const targetFormat = 'JSON'
        const output = processInput(input, format, maxLength, targetFormat)
        expect(output.content.endsWith('...')).toBe(true)
        expect(output.processedLength).toBe(output.content.length)
        expect(output.processedLength).toBeLessThanOrEqual(maxLength)
        expect(output.metadata.isCompressed).toBe(true)
      })
    })
  })
})
