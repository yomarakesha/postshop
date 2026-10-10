import { processColor } from 'react-native'

export function isColorDark(color: string): boolean {
  const processed = processColor(color)

  if (typeof processed !== 'number') return true

  const r = (processed >> 16) & 0xff
  const g = (processed >> 8) & 0xff
  const b = processed & 0xff

  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 140
}
