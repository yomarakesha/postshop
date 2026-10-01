import { describe, expect, it } from 'vitest'
import { isValidVendorBarcode, normalizeBarcode } from './barcode'

describe('isValidVendorBarcode', () => {
  it('принимает EAN-8, UPC-A, EAN-13 и GTIN-14', () => {
    for (const code of ['12345670', '012345678905', '4600000000000', '14600000000007']) {
      expect(isValidVendorBarcode(code)).toBe(true)
    }
  })

  it('пустое поле — не ошибка: штрихкод необязателен', () => {
    expect(isValidVendorBarcode('')).toBe(true)
    expect(isValidVendorBarcode('   ')).toBe(true)
  })

  it('не считает пробелы, как и сервер', () => {
    expect(isValidVendorBarcode('4 600000 000000')).toBe(true)
    expect(normalizeBarcode('4 600000 000000')).toBe('4600000000000')
  })

  it('отклоняет буквы и неверную длину', () => {
    expect(isValidVendorBarcode('46000000000A0')).toBe(false)
    expect(isValidVendorBarcode('1234567')).toBe(false)
    expect(isValidVendorBarcode('123456789')).toBe(false)
  })
})
