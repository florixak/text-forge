import { describe, expect, it } from 'vitest'
import {
  convertData,
  toCSV,
  toHTML,
  toJSON,
  toMarkdown,
  toXML,
} from './converters'

describe('Converters', () => {
  describe('toJSON', () => {
    it('should convert JSON to JSON', () => {
      const json = {
        name: 'John Doe',
        age: 30,
      }
      const result = toJSON(json)
      expect(result.success).toBe(true)
      expect(result.output).toBe(JSON.stringify(json, null, 2))
      expect(result.error).toBeUndefined()
    })
  })

  describe('toCSV', () => {
    it('should convert an array of objects to CSV', () => {
      const result = toCSV([
        { name: 'John Doe', age: 30 },
        { name: 'Ada', age: 36 },
      ])
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nJohn Doe,30\nAda,36')
      expect(result.error).toBeUndefined()
    })

    it('should convert a single object to a header plus one row', () => {
      const result = toCSV({ name: 'Ada', age: 36 })
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nAda,36')
      expect(result.error).toBeUndefined()
    })

    it('should convert space-separated text into CSV', () => {
      const result = toCSV('name age\nAda 36')
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nAda,36')
      expect(result.error).toBeUndefined()
    })

    it('should convert tab-separated text into CSV', () => {
      const result = toCSV('name\tage\nAda\t36')
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nAda,36')
      expect(result.error).toBeUndefined()
    })

    it('should quote fields that contain commas', () => {
      const result = toCSV([{ city: 'Prague, CZ', ok: true }])
      expect(result.output).toBe('city,ok\n"Prague, CZ",true')
    })

    it('should fail for an empty string', () => {
      const result = toCSV('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('No data to convert')
    })

    it('should fail for a non-object array', () => {
      const result = toCSV([1, 2, 3])
      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Data must be an array of objects or a single object to convert to CSV',
      )
    })
  })

  describe('toMarkdown', () => {
    it('should convert an array of objects to a markdown table', () => {
      const result = toMarkdown([
        { name: 'John', age: 30 },
        { name: 'Ada', age: 36 },
      ])
      expect(result.output).toBe(
        `| name | age |\n| --- | --- |\n| John | 30 |\n| Ada | 36 |\n`,
      )
    })

    it('should convert a single object to a bullet list', () => {
      const result = toMarkdown({ name: 'Ada', age: 36 })
      expect(result.output).toBe(`- **name**: Ada\n- **age**: 36\n`)
    })
  })

  describe('toHTML', () => {
    it('should convert an array of objects to HTML', () => {
      const result = toHTML([
        { name: 'John', age: 30 },
        { name: 'Ada', age: 36 },
      ])
      expect(result.success).toBe(true)
      expect(result.output).toContain('<th>name</th>')
      expect(result.output).toContain('<td>John</td>')
      expect(result.output).toContain('<td>30</td>')
      expect(result.output).toContain('<td>Ada</td>')
      expect(result.output).toContain('<td>36</td>')
    })

    it('should convert a single object to a header plus one row', () => {
      const result = toHTML({ name: 'Ada', age: 36 })
      expect(result.success).toBe(true)
      expect(result.output).toBe(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Converted Data</title>
</head>
<body>
  <dl>
    <dt><strong>name</strong></dt>
    <dd>Ada</dd>
    <dt><strong>age</strong></dt>
    <dd>36</dd>
  </dl>
</body>
</html>`)
    })

    it('should escape &lt;script&gt; tags', () => {
      const result = toHTML({
        name: 'Ada',
        age: 36,
        script: '<script>alert("Hello, world!");</script>',
      })
      expect(result.success).toBe(true)
      expect(result.output).toContain(
        '<dd>&lt;script&gt;alert(&quot;Hello, world!&quot;);&lt;/script&gt;</dd>',
      )
      expect(result.output).not.toContain('<script>')
    })
  })

  describe('toXML', () => {
    it('should wrap in <?xml ...?> and <root>...</root>', () => {
      const result = toXML([
        { name: 'John', age: 30 },
        { name: 'Ada', age: 36 },
      ])
      expect(result.success).toBe(true)
      expect(result.output).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item_0>
    <name>John</name>
    <age>30</age>
  </item_0>
  <item_1>
    <name>Ada</name>
    <age>36</age>
  </item_1>
</root>
`)
    })

    it("should sanitize names { '1name': 'x' } to <_1name>", () => {
      const result = toXML({ '1name': 'x' })
      expect(result.success).toBe(true)
      expect(result.output).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <_1name>x</_1name>
</root>
`)
    })

    it('should escape &, < in text', () => {
      const result = toXML({ name: 'Ada & <script>' })
      expect(result.success).toBe(true)
      expect(result.output).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>Ada &amp; &lt;script&gt;</name>
</root>
`)
    })
  })

  describe('convertData', () => {
    it('should convert JSON to CSV', () => {
      const result = convertData(
        JSON.stringify([{ name: 'Ada', age: 36 }]),
        'JSON',
        'CSV',
      )
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nAda,36')
      expect(result.error).toBeUndefined()
    })

    it('returns the parse error for garbage JSON', () => {
      const result = convertData('{not json', 'JSON', 'CSV')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('converts CSV to CSV', () => {
      const result = convertData('name,age\nAda,36', 'CSV', 'CSV')
      expect(result.success).toBe(true)
      expect(result.output).toBe('name,age\nAda,36')
      expect(result.error).toBeUndefined()
    })
  })
})
