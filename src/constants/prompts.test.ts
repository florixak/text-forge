import { describe, expect, it } from 'vitest'
import {
  assistPrompt,
  generatePrompt,
  getOutputTokenLimit,
  structurePrompt,
} from './prompts'

describe('Prompts', () => {
  describe('assistPrompt', () => {
    it.each([
      ['JSON', 'JSON'],
      ['JSON', 'CSV'],
    ] as const)(
      'should use from %s to %s and not contain {from} or {to} placeholder',
      (from, to) => {
        const prompt = assistPrompt(from, to)
        expect(prompt).toContain(`from ${from} to ${to}`)
        expect(prompt).not.toContain('{from}')
        expect(prompt).not.toContain('{to}')
      },
    )
  })

  describe('structurePrompt', () => {
    it.each(['JSON', 'CSV'] as const)(
      'should substitute %s and not contain {format} placeholder',
      (format) => {
        const prompt = structurePrompt(format)
        expect(prompt).toContain(`Return ONLY valid ${format}`)
        expect(prompt).toContain(`raw ${format}`)
        expect(prompt).not.toContain('{format}')
      },
    )
  })

  describe('generatePrompt', () => {
    it.each(['JSON', 'CSV'] as const)(
      'should substitute %s and not contain {format} placeholder',
      (format) => {
        const prompt = generatePrompt(format)
        expect(prompt).toContain(`valid ${format}`)
        expect(prompt).toContain(`raw ${format}`)
        expect(prompt).not.toContain('{format}')
      },
    )
  })

  describe('getOutputTokenLimit', () => {
    it.each([
      ['assist', 500],
      ['structure', 1000],
      ['generate', 2000],
    ] as const)(
      'should return the correct token limit for %s',
      (task, limit) => {
        expect(getOutputTokenLimit(task)).toBe(limit)
      },
    )
  })
})
