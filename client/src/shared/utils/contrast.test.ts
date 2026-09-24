import { describe, expect, it } from 'vitest'
import { CONTRAST_MIN, contrastLevel, contrastRatio } from './contrast'

/**
 * Контраст оформления магазина.
 *
 * От него зависит, увидит ли покупатель название магазина вообще: раньше можно
 * было сохранить белый текст на белом фоне, и название исчезало целиком.
 */
describe('contrastRatio', () => {
  it('чёрный на белом даёт предельные 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })

  it('одинаковые цвета дают 1 — текста не видно', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('порядок цветов не влияет на результат', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(contrastRatio('#abcdef', '#123456')!, 5)
  })

  it('понимает короткую запись цвета и запись без решётки', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(contrastRatio('ffffff', '000000')!, 5)
  })

  it('на неразборчивом цвете возвращает null, а не число наугад', () => {
    expect(contrastRatio('не цвет', '#ffffff')).toBeNull()
    expect(contrastRatio('#12345', '#ffffff')).toBeNull()
  })
})

describe('contrastLevel', () => {
  it('белое на белом — нечитаемо', () => {
    expect(contrastLevel('#ffffff', '#ffffff')).toBe('unreadable')
  })

  it('чёрное на белом — годится', () => {
    expect(contrastLevel('#000000', '#ffffff')).toBe('ok')
  })

  it('белое на бирюзовом читается и сохраняется', () => {
    // Тот самый случай: 2.5 — ниже нормы WCAG для крупного текста, но видно
    // прекрасно. Порог опускали именно из-за таких сочетаний, и тест держит
    // это решение: вернут порог к норме — проверка упадёт.
    const ratio = contrastRatio('#ffffff', '#1abc9c')!
    expect(ratio).toBeGreaterThan(CONTRAST_MIN)
    expect(contrastLevel('#ffffff', '#1abc9c')).toBe('ok')
  })

  it('заметная разница остаётся выбором владельца, а не ошибкой', () => {
    // Белое на светло-сером: WCAG такое запрещает, глазами читается. Витрина
    // молчит — ругается только на практически совпавшие цвета.
    expect(contrastLevel('#ffffff', '#c0c0c0')).toBe('ok')
  })

  it('почти совпавшие цвета — нечитаемо', () => {
    // Белое на #eee: разница есть, но названия фактически не видно.
    expect(contrastLevel('#ffffff', '#eeeeee')).toBe('unreadable')
  })

  it('на неразборчивом цвете не мешает сохранять', () => {
    expect(contrastLevel('мусор', '#ffffff')).toBe('ok')
  })
})
