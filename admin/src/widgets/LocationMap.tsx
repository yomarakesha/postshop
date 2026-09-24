import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'

import { LocalStorage } from '@/shared/lib/LocalStorage'
import { loadMapStyle } from '@/shared/lib/mapStyle'

// Ashgabat, Turkmenistan — used when no coordinates are set yet
const DEFAULT_CENTER: [number, number] = [58.3261, 37.9601]

interface Props {
  latitude: string
  longitude: string
  onChange: (latitude: string, longitude: string) => void
}

export function LocationMap({ latitude, longitude, onChange }: Props) {
  const [hasMapServer, setHasMapServer] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  const lastEmitted = useRef<{ latitude: string; longitude: string } | null>(null)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const hasCoords = latitude !== '' && longitude !== ''
    const center: [number, number] = hasCoords
      ? [Number(longitude), Number(latitude)]
      : DEFAULT_CENTER

    let cancelled = false

    // Стиль собирается на лету: слои из файла, адрес сервера — из настройки.
    // Отсюда асинхронность, поэтому создание карты живёт во вложенной
    // функции, а очистка снаружи — эффект не может быть async сам по себе.
    const init = async () => {
      const style = await loadMapStyle()
      if (cancelled || !containerRef.current) return
      if (!style) {
        setHasMapServer(false)
        return
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center,
        zoom: hasCoords ? 15 : 10,
        transformRequest: (url) => {
          const backendUrl = import.meta.env.VITE_BACKEND_API_URL
          const token = LocalStorage.get('access_token')
          if (token && backendUrl && url.startsWith(backendUrl)) {
            return { url, headers: { Authorization: `Bearer ${token}` } }
          }
          return { url }
        },
      })
      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      const marker = new maplibregl.Marker({ draggable: true }).setLngLat(center).addTo(map)

      const emit = (lngLat: maplibregl.LngLat) => {
        const next = { latitude: lngLat.lat.toFixed(6), longitude: lngLat.lng.toFixed(6) }
        lastEmitted.current = next
        onChangeRef.current(next.latitude, next.longitude)
      }

      marker.on('dragend', () => emit(marker.getLngLat()))
      map.on('click', (e) => {
        marker.setLngLat(e.lngLat)
        emit(e.lngLat)
      })

      mapRef.current = map
      markerRef.current = marker
    }

    void init()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const marker = markerRef.current
    const map = mapRef.current
    if (!marker || !map) return
    if (
      lastEmitted.current?.latitude === latitude &&
      lastEmitted.current?.longitude === longitude
    ) {
      return
    }
    if (latitude === '' || longitude === '') return

    const lngLat: [number, number] = [Number(longitude), Number(latitude)]
    if (Number.isNaN(lngLat[0]) || Number.isNaN(lngLat[1])) return

    marker.setLngLat(lngLat)
    map.flyTo({ center: lngLat })
  }, [latitude, longitude])

  // Пока картографический сервер не задан, вместо пустого поля — объяснение.
  // Координаты в этом случае вводятся полями выше, карта их не заменяет.
  if (!hasMapServer) {
    return (
      <div className="h-120 w-full rounded-lg bg-gray-100 flex items-center justify-center p-4">
        <p className="text-sm text-gray-500 text-center">
          Карта недоступна: картографический сервер не настроен (VITE_MAP_TILES_URL). Координаты
          можно ввести вручную.
        </p>
      </div>
    )
  }

  return <div ref={containerRef} className="h-120 w-full rounded-lg" />
}
