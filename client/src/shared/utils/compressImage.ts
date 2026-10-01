/**
 * Сжатие картинки в браузере перед загрузкой.
 *
 * Фото с телефона весит 4–8 МБ, а сервер всё равно ужимает его до webp на
 * своей стороне. На слабой мобильной связи такой файл грузился минутами и
 * обрывался на середине — тестировщик получил «Нет связи с сервером», просто
 * меняя логотип магазина. Уменьшенная до ~1600 px картинка весит в десятки раз
 * меньше и доходит с первой попытки, а на витрине разницы не видно.
 */

/** Почему файл не удалось подготовить: причина нужна для текста сообщения. */
export type ImageProcessingReason = 'not-image' | 'unreadable'

export class ImageProcessingError extends Error {
  readonly reason: ImageProcessingReason

  constructor(reason: ImageProcessingReason) {
    super(reason)
    this.name = 'ImageProcessingError'
    this.reason = reason
  }
}

export interface CompressImageOptions {
  /** Предел длинной стороны в пикселях. */
  maxSize?: number
  /** Качество кодирования webp/jpeg, 0–1. */
  quality?: number
}

/** Фото товара: крупнее на витрине не показывается. */
export const PRODUCT_IMAGE_MAX_SIZE = 1600
/** Логотип рисуется максимум в 128 px — 1024 с запасом на любые экраны. */
export const LOGO_IMAGE_MAX_SIZE = 1024

/**
 * Маленький файл без уменьшения не перекодируем: выигрыша нет, а лишний
 * проход кодека может сделать его даже тяжелее.
 */
const SMALL_ENOUGH_BYTES = 300 * 1024

const decode = async (
  file: File,
): Promise<CanvasImageSource & { width: number; height: number }> => {
  // createImageBitmap сам поворачивает фото по EXIF: без этого снимок с
  // телефона после перерисовки на холсте ложился бы на бок.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Старый Safari не знает параметра imageOrientation — пробуем через <img>.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

/**
 * Уменьшает картинку до `maxSize` по длинной стороне и кодирует в webp
 * (где браузер не умеет webp — в jpeg, а png с прозрачностью — в png).
 *
 * Не картинку и то, что браузер не смог прочитать (например, HEIC в Chrome),
 * отклоняет с ImageProcessingError: такой файл сервер тоже не примет, и
 * лучше сказать об этом сразу, а не после долгой загрузки.
 */
export const compressImage = async (
  file: File,
  { maxSize = PRODUCT_IMAGE_MAX_SIZE, quality = 0.85 }: CompressImageOptions = {},
): Promise<File> => {
  if (!file.type.startsWith('image/')) throw new ImageProcessingError('not-image')

  let source: Awaited<ReturnType<typeof decode>>
  try {
    source = await decode(file)
  } catch {
    throw new ImageProcessingError('unreadable')
  }

  const { width, height } = source
  if (!width || !height) throw new ImageProcessingError('unreadable')

  const scale = Math.min(1, maxSize / Math.max(width, height))
  if (scale === 1 && file.size <= SMALL_ENOUGH_BYTES && file.type in EXTENSIONS) {
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new ImageProcessingError('unreadable')
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  if ('close' in source && typeof source.close === 'function') source.close()

  // toBlob молча отдаёт png, если просимый формат не поддержан (старый
  // Safari и webp), поэтому тип результата проверяем, а не предполагаем.
  let blob = await toBlob(canvas, 'image/webp', quality)
  if (!blob || blob.type !== 'image/webp') {
    // В jpeg прозрачность становится чёрным фоном — логотипу с прозрачным
    // фоном это хуже лишних килобайт, поэтому png остаётся png.
    const fallback = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    blob = await toBlob(canvas, fallback, quality)
  }
  if (!blob) throw new ImageProcessingError('unreadable')

  // Перекодирование без уменьшения иногда тяжелее исходника — тогда шлём его.
  if (scale === 1 && blob.size >= file.size && file.type in EXTENSIONS) return file

  const extension = EXTENSIONS[blob.type] ?? 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  })
}

/** Ключ перевода для сообщения о файле, который не удалось подготовить. */
export const imageErrorKey = (error: unknown) =>
  error instanceof ImageProcessingError && error.reason === 'not-image'
    ? 'upload.notImage'
    : 'upload.unreadable'
