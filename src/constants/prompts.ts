import { InputFormat } from '.'

const assistPrompt = (fromFormat: InputFormat, toFormat: InputFormat) =>
  `Give few, short, clear tips to convert from ${fromFormat} to ${toFormat}. Do not provide the converted data, only the tips.`

const structurePrompt = (format: string) =>
  `Convert text into structured ${format}. Return only valid ${format} data, without any extra text.`

const generatePrompt = (format: string) =>
  `Generate structured data in ${format} based on the user's description. Return only valid ${format} data, without any extra text.`

export { assistPrompt, structurePrompt, generatePrompt }
