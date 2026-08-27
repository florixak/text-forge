import { describe, expect, it } from 'vitest'
import {
  detectInputType,
  parseCSV,
  parseHTML,
  parseInput,
  parseJSON,
  parseMarkdown,
  parseText,
  parseXML,
} from './parsers'

describe('Parsers', () => {
  describe('parseJSON', () => {
    it('should parse valid JSON', () => {
      const result = parseJSON('{"name": "John", "age": 30}')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'John', age: 30 })
      expect(result.type).toEqual('JSON')
    })

    it('should return an error for invalid JSON', () => {
      const result = parseJSON('invalid JSON')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
      expect(result.type).toBe('JSON')
    })

    it('should return an error for empty input', () => {
      const result = parseJSON('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
      expect(result.type).toEqual('JSON')
    })

    it('should parse a JSON array', () => {
      const result = parseJSON('[1,2]')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2])
      expect(result.type).toEqual('JSON')
    })
  })

  describe('parseCSV', () => {
    it('should parse valid CSV', () => {
      const result = parseCSV('name,age\nJohn,30')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([{ name: 'John', age: '30' }])
      expect(result.type).toEqual('CSV')
    })

    it('should return an error for invalid CSV', () => {
      const result = parseCSV('Invalid CSV')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
      expect(result.type).toEqual('CSV')
    })

    it('should return an error when there is only a header row', () => {
      const result = parseCSV('name,age')
      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'CSV requires at least a header row and one data row',
      )
      expect(result.data).toBeUndefined()
      expect(result.type).toEqual('CSV')
    })

    it('should return an error for empty input', () => {
      const result = parseCSV('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
      expect(result.type).toEqual('CSV')
    })

    it('should keep commas inside quoted fields', () => {
      const result = parseCSV('city,note\n"Prague, CZ",ok')
      expect(result.data).toEqual([{ city: 'Prague, CZ', note: 'ok' }])
    })

    it('should unescape doubled quotes', () => {
      const result = parseCSV('name,quote\nAda,"she said ""hi"""')
      expect(result.data).toEqual([{ name: 'Ada', quote: 'she said "hi"' }])
    })

    it('should fill missing columns with empty strings', () => {
      const result = parseCSV('a,b,c\n1,2')
      expect(result.data).toEqual([{ a: '1', b: '2', c: '' }])
    })
  })

  describe('parseXML', () => {
    it('should parse valid XML', () => {
      const result = parseXML(`
          <person>
            <name>John</name>
            <age>30</age>
          </person>
        `)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        person: { name: 'John', age: '30' },
      })
      expect(result.type).toEqual('XML')
    })

    it('should return an error for invalid XML', () => {
      const result = parseXML('Invalid XML')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBeUndefined()
      expect(result.type).toEqual('XML')
    })

    it('should return an error for empty input', () => {
      const result = parseXML('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
      expect(result.type).toEqual('XML')
    })
  })

  describe('parseMarkdown', () => {
    it('should return an empty structure when there are no code fences', () => {
      const result = parseMarkdown('# Hello, World!\n- a list item')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(result.type).toBe('Markdown')
    })

    it('should record code fence start and end', () => {
      const result = parseMarkdown('```js\nconst x = 1\n```')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([
        { type: 'code-block-start', content: '```js' },
        { type: 'code-block-end', content: '```' },
      ])
      expect(result.type).toBe('Markdown')
    })

    it('should return an error for empty input', () => {
      const result = parseMarkdown('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
      expect(result.data).toBeUndefined()
      expect(result.type).toBe('Markdown')
    })
  })

  describe('parseHTML', () => {
    it('should extract title and body innerHTML', () => {
      const result = parseHTML(
        '<html><head><title>Page</title></head><body><h1>Hello, World!</h1></body></html>',
      )
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        title: 'Page',
        body: '<h1>Hello, World!</h1>',
        head: '<title>Page</title>',
      })
      expect(result.type).toBe('HTML')
    })

    it('should return an error for empty input', () => {
      const result = parseHTML('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
      expect(result.data).toBeUndefined()
      expect(result.type).toBe('HTML')
    })
  })

  describe('parseText', () => {
    it('should parse valid text', () => {
      const result = parseText('Hello, World!')
      expect(result.success).toBe(true)
      expect(result.data).toEqual('Hello, World!')
      expect(result.type).toEqual('Text')
    })

    it('should return a success even with empty input', () => {
      const result = parseText('')
      expect(result.success).toBe(true)
      expect(result.data).toBe('')
      expect(result.type).toEqual('Text')
    })
  })

  describe('detectInputType', () => {
    it('should detect JSON format', () => {
      const result = detectInputType('{}')
      expect(result).toBe('JSON')
    })
    it('should detect CSV format', () => {
      const result = detectInputType('name,age\nJohn,24')
      expect(result).toBe('CSV')
    })
    it('should detect XML format', () => {
      const result = detectInputType(`
        <person>
          <name>John</name>
          <age>24</age>
        </person>
      `)
      expect(result).toBe('XML')
    })
    it('should detect Markdown format', () => {
      const result = detectInputType('# Hello, World!')
      expect(result).toBe('Markdown')
    })
    it('should detect HTML format', () => {
      const result = detectInputType(
        '<!DOCTYPE html><html><body>Hi</body></html>',
      )
      expect(result).toBe('HTML')
    })

    it('should treat a bare <html> document as XML with the current heuristics', () => {
      const result = detectInputType('<html><body>Hi</body></html>')
      expect(result).toBe('XML')
    })

    it('should fall back to Text', () => {
      const result = detectInputType('just some words')
      expect(result).toBe('Text')
    })
  })

  describe('parseInput', () => {
    it('should route JSON by type', () => {
      const result = parseInput('{"ok":true}', 'JSON')
      expect(result.success).toBe(true)
      expect(result.type).toBe('JSON')
      expect(result.data).toEqual({ ok: true })
    })

    it('should auto-detect JSON', () => {
      const result = parseInput('{"ok":true}', 'Auto-detect')
      expect(result.type).toBe('JSON')
      expect(result.data).toEqual({ ok: true })
    })

    it('should reject whitespace-only input', () => {
      const result = parseInput('   ', 'JSON')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is empty')
    })
  })
})
