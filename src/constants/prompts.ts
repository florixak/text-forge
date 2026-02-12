import { InputFormat, OutputFormat } from '@/types'

const SYSTEM_PROMPTS = {
  //assist: `Fix issues in {from} converting to {to}, no code blocks, extra text, or \`\`\`{format} marks.`,
  assist: `Give short tips or fixes for converting {from} to {to}. Focus on common pitfalls and best practices. Keep it concise. No explanations, just tips.`,
  structure: `Return only valid {format}, no code blocks, extra text, or \`\`\`{format} marks.`,
  generate: `Return only valid {format}, no code blocks, extra text, or \`\`\`{format} marks.`,
} as const

const OUTPUT_TOKEN_LIMITS = {
  assist: 1000,
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
