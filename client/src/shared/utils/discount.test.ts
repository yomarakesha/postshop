import { describe, expect, it } from 'vitest'
import { getDiscountInfo } from './discount'
import { DiscountType } from '#/shared/openapi/requests/types.gen'

/**
 * Расчёт скидки — единственное место витрины, где считаются деньги.
 *
 * Ошибка здесь стоит дороже любой другой: покупатель видит одну цену, а платит
 * другую. Проверок на это не было, хотя функция чистая и проверяется в
 * несколько строк.
 */
describe('getDiscountInfo', () => {
  it('без скидки отдаёт исходную цену и не выдумывает старую', () => {
    expect(getDiscountInfo(100)).toEqual({ price: 100 })
    expect(getDiscountInfo(100, 0, DiscountType.PERCENTAGE)).toEqual({ price: 100 })
    expect(getDiscountInfo(100, null, DiscountType.FIXED)).toEqual({ price: 100 })
  })

  it('процентная скидка уменьшает цену и показывает прежнюю', () => {
    expect(getDiscountInfo(1000, 10, DiscountType.PERCENTAGE)).toEqual({
      price: 900,
      oldPrice: 1000,
      discountPercent: 10,
    })
  })

  it('фиксированная скидка вычитается и пересчитывается в проценты', () => {
    expect(getDiscountInfo(200, 50, DiscountType.FIXED)).toEqual({
      price: 150,
      oldPrice: 200,
      discountPercent: 25,
    })
  })

  it('принимает скидку строкой: с сервера Decimal приходит именно так', () => {
    expect(getDiscountInfo(1000, '20', DiscountType.PERCENTAGE).price).toBe(800)
  })

  it('не делит на ноль у бесплатного товара', () => {
    const result = getDiscountInfo(0, 10, DiscountType.FIXED)
    expect(Number.isFinite(result.price)).toBe(true)
    expect(result.discountPercent).toBeUndefined()
  })

  it('скидка больше цены уводит её в минус — это видно и должно быть замечено', () => {
    // Проверка фиксирует нынешнее поведение, а не одобряет его: сервер такую
    // скидку принимает, и на витрине появится отрицательная цена. Если правило
    // изменится, тест упадёт и заставит решить осознанно.
    expect(getDiscountInfo(100, 150, DiscountType.FIXED).price).toBe(-50)
  })
})
