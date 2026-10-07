/**
 * Стиль карты со ссылками на картографический сервер.
 *
 * Адрес сервера раньше был вписан прямо в `public/map_styles.json` — вместе с
 * ключом доступа. Сервер отключён, нового пока нет, поэтому в файле остались
 * только слои и цвета, а адрес приходит из настройки `VITE_MAP_TILES_URL`.
 *
 * Пока адрес не задан, возвращается `null`: карту в этом случае рисовать
 * нечем, и виджет показывает объяснение вместо пустого серого поля.
 */
export const MAP_TILES_BASE_URL: string | undefined = import.meta.env.VITE_MAP_TILES_URL

export async function loadMapStyle(): Promise<maplibregl.StyleSpecification | null> {
  if (!MAP_TILES_BASE_URL) return null

  const response = await fetch(`${import.meta.env.BASE_URL}map_styles.json`)
  if (!response.ok) return null

  const style = await response.json()
  const base = MAP_TILES_BASE_URL.replace(/\/+$/, '')

  return {
    ...style,
    sources: {
      ...style.sources,
      turkmenistan: {
        ...style.sources?.turkmenistan,
        tiles: [`${base}/v1/maps/tiles/{z}/{x}/{y}.pbf`],
      },
    },
    sprite: `${base}/v1/maps/sprites/sprite`,
    glyphs: `${base}/v1/maps/fonts/{fontstack}/{range}.pbf`,
  }
}
