import { describe, expect, it } from 'vitest'
import { formatDate, formatNumericDate, formatNumericDateTime, getZonedParts } from './formatDate'

/**
 * Время показывается по Ашхабаду (UTC+5) независимо от часов того, кто
 * рендерит: раньше SSR и браузер выводили разное время одного заказа.
 */
describe('formatNumericDateTime', () => {
  it('переводит UTC в ашхабадское время', () => {
    expect(formatNumericDateTime('2026-09-23T05:50:00Z')).toBe('23.09.2026 10:50')
  })

  it('переносит на следующий день, когда в Ашхабаде уже полночь', () => {
    expect(formatNumericDateTime('2026-09-30T19:30:00Z')).toBe('01.10.2026 00:30')
  })

  it('читает время без зоны как UTC', () => {
    expect(formatNumericDateTime('2026-09-23T05:50:00')).toBe('23.09.2026 10:50')
  })

  it('понимает явное смещение', () => {
    expect(formatNumericDateTime('2026-09-23T10:50:00+05:00')).toBe('23.09.2026 10:50')
  })

  it('на мусоре возвращает пустую строку, а не «NaN.NaN»', () => {
    expect(formatNumericDateTime('не дата')).toBe('')
  })
})

describe('formatNumericDate', () => {
  it('не сдвигает календарную дату без времени', () => {
    expect(formatNumericDate('2026-09-23')).toBe('23.09.2026')
  })
})

describe('getZonedParts', () => {
  it('отдаёт месяц заказа по Ашхабаду, а не по UTC', () => {
    expect(getZonedParts('2026-09-30T19:30:00Z')).toMatchObject({ year: 2026, month: 10, day: 1 })
  })
})

describe('formatDate', () => {
  it('форматирует по языку в зоне Ашхабада', () => {
    expect(formatDate('2026-09-23T19:30:00Z', 'en-GB', { day: '2-digit', month: '2-digit' })).toBe(
      '24/09',
    )
  })
})
