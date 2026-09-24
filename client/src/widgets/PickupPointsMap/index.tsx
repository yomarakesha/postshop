import maplibregl from 'maplibre-gl'
// Imported here (not via the Tailwind-processed stylesheet) so its rules stay
// unlayered — routing it through styles.css got it swept into Tailwind's
// @layer utilities, which silently dropped `.maplibregl-marker`'s
// `position: absolute`, sending every marker/control off-screen.
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { markerSvg } from './markerSvg'
import type { PickupPointResponse } from '#/shared/openapi/requests/types.gen'
import { loadMapStyle } from '#/shared/lib/mapStyle'

// Ashgabat, Turkmenistan — used when there are no points to fit bounds to
const DEFAULT_CENTER: [number, number] = [58.3261, 37.9601]

const RING_SELECTOR = '[data-marker-ring]'
const SELECTED_RING_COLOR = '#0750d5'

interface Props {
  points: Array<PickupPointResponse>
  selectedId: number | null
  onSelect: (id: number) => void
}

export function PickupPointsMap({ points, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const [hasMapServer, setHasMapServer] = useState(true)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!containerRef.current) return

    let map: maplibregl.Map | null = null
    let cancelled = false

    // Стиль собирается на лету: слои берутся из файла, а адрес сервера — из
    // настройки. Пока адрес не задан, карты нет вовсе, и рисовать её нечем.
    void loadMapStyle().then((style) => {
      if (cancelled || !containerRef.current) return
      if (!style) {
        setHasMapServer(false)
        return
      }

      map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: DEFAULT_CENTER,
        zoom: 11,
      })
      map.addControl(new maplibregl.NavigationControl(), 'top-right')
      mapRef.current = map
      setHasMapServer(true)
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const renderMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()

      const bounds = new maplibregl.LngLatBounds()

      points.forEach((point) => {
        const lng = Number(point.longitude)
        const lat = Number(point.latitude)
        if (Number.isNaN(lng) || Number.isNaN(lat)) return

        const el = document.createElement('div')
        el.style.cursor = 'pointer'
        el.title = point.name
        el.innerHTML = markerSvg(`pickup-${point.id}`)

        const ring = el.querySelector<SVGPathElement>(RING_SELECTOR)
        ring?.setAttribute('stroke', point.id === selectedId ? SELECTED_RING_COLOR : 'none')

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map)

        el.addEventListener('click', () => onSelectRef.current(point.id))

        markersRef.current.set(point.id, marker)
        bounds.extend([lng, lat])
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 })
      }
    }

    if (map.isStyleLoaded()) renderMarkers()
    else map.once('load', renderMarkers)
    // Re-renders markers when points change; selection highlight updates via the effect below.
  }, [points])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const ring = marker.getElement().querySelector<SVGPathElement>(RING_SELECTOR)
      ring?.setAttribute('stroke', id === selectedId ? SELECTED_RING_COLOR : 'none')
    })
  }, [selectedId])

  // Пока картографический сервер не задан, вместо серого пустого поля —
  // объяснение: карты не будет, и это не сбой загрузки.
  if (!hasMapServer) {
    return (
      <div className="h-100 w-full rounded-lg bg-gray2 flex items-center justify-center p-4">
        <p className="p3 text-passive2 text-center">{t('checkout.mapUnavailable')}</p>
      </div>
    )
  }

  return <div ref={containerRef} className="h-100 w-full rounded-lg overflow-hidden" />
}
