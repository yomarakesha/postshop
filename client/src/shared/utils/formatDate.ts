/**
 * Даты и время для показа — всегда по Ашхабаду.
 *
 * Сервер отдаёт время в UTC с явной зоной («2026-09-23T05:50:00Z»). Раньше
 * витрина выводила его через getHours()/getDate() или Intl без зоны, то есть по
 * часам того, кто рендерит: при SSR — по часам сервера, в браузере — по часам
 * телефона. Одна и та же страница показывала разное время до и после гидрации,
 * а заказ, сделанный в 00:30 по Ашхабаду, попадал в «прошлый день» и в чужой
 * месяц. Покупатели и продавцы — в Туркменистане, поэтому зона одна и задана
 * явно: Intl с `timeZone` считает одинаково и на сервере, и в браузере.
 *
 * Только для показа. Арифметику с датами (сроки, сравнения) это не трогает.
 */
export const APP_TIME_ZONE = 'Asia/Ashgabat'

type DateInput = string | number | Date

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const HAS_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i

/**
 * Строка без зоны — это UTC: так время хранит сервер. Без этой поправки
 * `new Date('2026-09-23T05:50:00')` прочитался бы как местное время того, кто
 * рендерит, и сдвиг вернулся бы через старые ответы или кэш.
 */
const toDate = (value: DateInput): Date => {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (DATE_ONLY.test(value) || HAS_ZONE.test(value)) return new Date(value)
  return new Date(`${value}Z`)
}

/**
 * Чистая дата («2026-09-23», точка графика) — это календарный день, а не
 * момент времени. Её показываем в UTC, где она и разобрана: иначе день мог бы
 * съехать при переводе в любую зону западнее Гринвича.
 */
const zoneFor = (value: DateInput) =>
  typeof value === 'string' && DATE_ONLY.test(value) ? 'UTC' : APP_TIME_ZONE

// Intl.DateTimeFormat создаётся дорого, а списки заказов и уведомлений
// форматируют десятки дат за рендер.
const formatters = new Map<string, Intl.DateTimeFormat>()

const getFormatter = (locale: string, timeZone: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone })
    formatters.set(key, formatter)
  }
  return formatter
}

const isValid = (date: Date) => !Number.isNaN(date.getTime())

/** Дата/время по правилам языка интерфейса, в зоне Ашхабада. */
export const formatDate = (
  value: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string => {
  const date = toDate(value)
  if (!isValid(date)) return ''
  return getFormatter(locale, zoneFor(value), options).format(date)
}

export interface ZonedParts {
  year: number
  /** 1–12, а не 0–11, как у Date#getMonth. */
  month: number
  day: number
  hour: number
  minute: number
}

/**
 * Составные части даты в зоне Ашхабада — для своих форматов и для
 * группировки по месяцам (заголовок «Сентябрь 2026» над списком заказов).
 */
export const getZonedParts = (value: DateInput): ZonedParts | null => {
  const date = toDate(value)
  if (!isValid(date)) return null
  // en-US с h23 — только ради предсказуемых числовых частей, язык здесь не
  // виден: наружу уходят числа.
  const parts = getFormatter('en-US', zoneFor(value), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** «23.09.2026» — числовая дата, одинаковая во всех языках. */
export const formatNumericDate = (value: DateInput): string => {
  const p = getZonedParts(value)
  return p ? `${pad(p.day)}.${pad(p.month)}.${p.year}` : ''
}

/** «23.09.2026 10:50» — числовые дата и время, одинаковые во всех языках. */
export const formatNumericDateTime = (value: DateInput): string => {
  const p = getZonedParts(value)
  return p ? `${pad(p.day)}.${pad(p.month)}.${p.year} ${pad(p.hour)}:${pad(p.minute)}` : ''
}
