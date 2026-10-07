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

  const response = await fetch('/map_styles.json')
  if (!response.ok) return null

  const style = await response.json()
  // MapLibre грузит тайлы в web worker, где относительный адрес («/api»)
  // не разрешается — карта остаётся пустой. Приводим к полному адресу.
  const base = new URL(MAP_TILES_BASE_URL, window.location.origin).href.replace(/\/+$/, '')

  return {
    ...style,
    sources: {
      ...style.sources,
      turkmenistan: {
        ...style.sources?.turkmenistan,
        tiles: [`${base}/v1/maps/tiles/{z}/{x}/{y}.pbf`],
        // Лицензия данных OSM и схемы OpenMapTiles требует видимой подписи.
        attribution: '© OpenMapTiles © OpenStreetMap contributors',
      },
    },
    sprite: `${base}/v1/maps/sprites/sprite`,
    glyphs: `${base}/v1/maps/fonts/{fontstack}/{range}.pbf`,
  }
}
