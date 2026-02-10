import { InputFormat, OutputFormat } from '@/types'

const SYSTEM_PROMPTS = {
  assist: `Convert tips: {from} → {to}. Short, actionable only. No data.`,
  structure: `Output {format} only. Valid, no extra text.`,
  generate: `Generate {format} per description. Valid only.`,
} as const

const OUTPUT_TOKEN_LIMITS = {
  assist: 100,
  structure: 2000,
  generate: 3000,
} as const

export function assistPrompt(
  fromFormat: InputFormat,
  toFormat: OutputFormat,
): string {
  return SYSTEM_PROMPTS.assist
    .replace('{from}', fromFormat)
    .replace('{to}', toFormat)
}

export function structurePrompt(format: OutputFormat): string {
  return SYSTEM_PROMPTS.structure.replace('{format}', format)
}

export function generatePrompt(format: OutputFormat): string {
  return SYSTEM_PROMPTS.generate.replace('{format}', format)
}

export function getOutputTokenLimit(
  task: 'assist' | 'structure' | 'generate',
): number {
  return OUTPUT_TOKEN_LIMITS[task]
}

export { SYSTEM_PROMPTS, OUTPUT_TOKEN_LIMITS }
