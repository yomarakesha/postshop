import type { ImagePickerAsset } from 'expo-image-picker'

/** Длинная сторона фото товара после уменьшения. */
export const PRODUCT_IMAGE_MAX_SIDE = 1600
/** Логотип показывается маленьким — ему хватает и 1024. */
export const LOGO_IMAGE_MAX_SIDE = 1024

/**
 * Уменьшает выбранное фото до `maxSide` по длинной стороне перед загрузкой.
 *
 * Зачем: пикер отдавал снимок в полном разрешении камеры (12–48 Мп). `quality`
 * пикера только пережимает JPEG, но не уменьшает размер в пикселях — файлы по
 * несколько мегабайт на слабом мобильном интернете не догружались, и
 * сохранение товара или логотипа падало.
 *
 * Модуль грузим лениво и в try: `expo-image-manipulator` — нативный, и в
 * сборке без него импорт сверху уронил бы весь экран. Если уменьшить не
 * вышло, отдаём исходный файл — загрузка хотя бы попробует пройти, как раньше.
 */
export const downscaleImage = async (
  asset: ImagePickerAsset,
  maxSide: number,
): Promise<ImagePickerAsset> => {
  const { width, height } = asset
  // Размеры неизвестны (например, уже загруженная картинка, скачанная для
  // редактирования) или фото и так небольшое — не трогаем.
  if (!width || !height || Math.max(width, height) <= maxSide) return asset

  try {
    const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator')
    const context = ImageManipulator.manipulate(asset.uri)
    context.resize(width >= height ? { width: maxSide } : { height: maxSide })
    const image = await context.renderAsync()
    const result = await image.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    })
    context.release()
    image.release()

    const baseName = (asset.fileName ?? 'image').replace(/\.[^.]+$/, '')
    return {
      ...asset,
      uri: result.uri,
      width: result.width,
      height: result.height,
      fileName: `${baseName}.jpg`,
      mimeType: 'image/jpeg',
      fileSize: undefined,
    }
  } catch (e) {
    console.warn('[downscaleImage] resize failed, uploading original', e)
    return asset
  }
}

/** То же для нескольких фото сразу. */
export const downscaleImages = (assets: ImagePickerAsset[], maxSide: number) =>
  Promise.all(assets.map((asset) => downscaleImage(asset, maxSide)))
