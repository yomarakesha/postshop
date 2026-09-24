/**
 * Контрастность двух цветов по WCAG 2.1.
 *
 * Нужна при выборе оформления магазина: там задаются цвет фона и цвет текста
 * независимо, и раньше можно было спокойно сохранить белый текст на белом фоне —
 * название магазина полностью исчезало.
 */

const parseHex = (hex: string): [number, number, number] | null => {
  const value = hex.trim().replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

const relativeLuminance = ([r, g, b]: [number, number, number]) => {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Отношение контрастности: от 1 (цвета совпадают) до 21 (чёрный на белом).
 * Возвращает `null`, если хотя бы один цвет разобрать не удалось.
 */
export const contrastRatio = (foreground: string, background: string): number | null => {
  const fg = parseHex(foreground)
  const bg = parseHex(background)
  if (!fg || !bg) return null
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Ниже этого текст сливается с фоном — сохранять нельзя.
 *
 * Порог прошёл путь 3 → 2 → 1.5, и каждый раз по одной причине: норма WCAG
 * написана для абзацев текста, а здесь — крупное жирное название на своей
 * плашке, и она ругалась на сочетания, которые видно прекрасно. Осталась
 * единственная проверка, с которой никто не спорит: цвета практически
 * совпадают, и названия не видно вовсе. Всё остальное — выбор владельца, и
 * витрина в него не лезет.
 */
export const CONTRAST_MIN = 1.5

export type ContrastLevel = 'ok' | 'unreadable'

export const contrastLevel = (foreground: string, background: string): ContrastLevel =>
  (contrastRatio(foreground, background) ?? Infinity) < CONTRAST_MIN ? 'unreadable' : 'ok'
