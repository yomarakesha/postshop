/**
 * Штрихкод производителя, который вводит продавец.
 *
 * Правило то же, что на сервере (app/services/barcode.py): только цифры, длина
 * 8, 12, 13 или 14 (EAN-8, UPC-A, EAN-13, GTIN-14), пробелы не считаются.
 * Проверяем заранее, чтобы продавец узнал об опечатке у самого поля, а не
 * служебным английским текстом после отправки формы с фотографиями.
 * Контрольную цифру не проверяем: сервер её не требует, и строже него быть
 * незачем — иначе продавец не смог бы ввести код, который сервер принял бы.
 */
export const VENDOR_BARCODE_LENGTHS = [8, 12, 13, 14]

/** Пробелы убираем: код часто переписывают с упаковки группами цифр. */
export const normalizeBarcode = (value: string) => value.replace(/\s+/g, '')

/** Пустое поле — это «штрихкода нет», а не ошибка. */
export const isValidVendorBarcode = (value: string) => {
  const code = normalizeBarcode(value)
  if (!code) return true
  return /^\d+$/.test(code) && VENDOR_BARCODE_LENGTHS.includes(code.length)
}
