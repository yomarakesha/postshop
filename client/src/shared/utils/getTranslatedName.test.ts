import { describe, expect, it } from 'vitest'
import { getTranslatedName } from './getTranslatedName'

/**
 * Выбор названия по языку.
 *
 * Раньше название бралось жёстко на туркменском, и на русской витрине товары
 * назывались по-туркменски. Пустая строка вместо названия недопустима: карточка
 * товара без имени выглядит как поломка.
 */
describe('getTranslatedName', () => {
  const translations = [
    { language: 'tk', name: 'Nusay' },
    { language: 'ru', name: 'Нусай' },
    { language: 'en', name: 'Nusay EN' },
  ]

  it('берёт перевод на нужном языке', () => {
    expect(getTranslatedName(translations, 'ru')).toBe('Нусай')
    expect(getTranslatedName(translations, 'en')).toBe('Nusay EN')
  })

  it('на языке без перевода берёт первый доступный, а не пустоту', () => {
    expect(getTranslatedName(translations, 'tr')).toBe('Nusay')
  })

  it('на пустом списке отдаёт пустую строку, а не падает', () => {
    expect(getTranslatedName([], 'ru')).toBe('')
    expect(getTranslatedName(undefined, 'ru')).toBe('')
  })
})
