import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadFile } from './download'

describe('downloadFile', () => {
  describe('empty content', () => {
    it('should return false and does not download', () => {
      expect(downloadFile('', 'JSON')).toBe(false)
    })
  })

  describe('successful download', () => {
    const click = vi.fn()
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock')
    const revokeObjectURL = vi.fn()

    beforeEach(() => {
      click.mockReset()
      createObjectURL.mockClear()
      revokeObjectURL.mockClear()
      URL.createObjectURL = createObjectURL
      URL.revokeObjectURL = revokeObjectURL
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click)
    })

    afterEach(() => {
      Reflect.deleteProperty(URL, 'createObjectURL')
      Reflect.deleteProperty(URL, 'revokeObjectURL')
      vi.restoreAllMocks()
    })

    it('should return true, uses the given filename, and cleans up', () => {
      click.mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('export.json')
        expect(this.href).toContain('blob:mock')
      })

      const result = downloadFile('{"a":1}', 'JSON', 'export.json')

      expect(result).toBe(true)
      expect(click).toHaveBeenCalledOnce()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
      expect(document.body.querySelector('a')).toBeNull()
    })

    it('should create a blob with the matching MIME type', () => {
      downloadFile('[]', 'JSON')

      const blob = createObjectURL.mock.calls[0][0] as Blob
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/json')
    })

    it.each([
      ['json', 'JSON'],
      ['csv', 'CSV'],
      ['md', 'Markdown'],
      ['txt', 'Text'],
    ] as const)('defaults to .%s for %s', (ext, type) => {
      vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)

      click.mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe(`converted-1700000000000.${ext}`)
      })

      downloadFile('hello', type)
      expect(click).toHaveBeenCalled()
    })
  })
})
