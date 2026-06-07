import type {TextPart} from '../types'

export type TaggedPart = Exclude<TextPart, string>
export type Line = (string | TaggedPart)[]

export const buildLines = (sourceParts: TextPart[]): Line[] => {
  const lines: Line[] = [[]]
  for (const part of sourceParts) {
    if (typeof part === 'string') {
      const segments = part.split('\n')
      lines[lines.length - 1]!.push(segments[0]!)
      for (let i = 1; i < segments.length; i++) {
        lines.push([segments[i]!])
      }
    } else {
      lines[lines.length - 1]!.push(part)
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.every(item => typeof item === 'string' && item === '')) {
      lines[i] = []
    }
  }
  return lines
}
