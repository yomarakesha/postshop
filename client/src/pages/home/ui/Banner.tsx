import { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { BannerResponse } from '@/shared/openapi/requests/types.gen'
import { useGetBannersBannersGet } from '@/shared/openapi/queries/queries'
import { Skeleton } from '@/shared/ui/Skeleton'
import CaretIcon from '@/shared/assets/icons/caret.svg?react'

function getBannerImage(banner: BannerResponse, lang: string): string | null {
  const match = banner.images.find((img) => img.language === lang)
  const fallback = banner.images.find((img) => img.image_path)
  const path = match?.image_path ?? fallback?.image_path
  if (!path) return null
  return import.meta.env.VITE_BACKEND_API_URL + '/' + path
}

export const Banner = () => {
  const { i18n } = useTranslation()
  // duration — длительность прокрутки в кадрах у embla: по умолчанию 25, то
  // есть рывок. 34 даёт спокойный ход, заметный, но не медленный.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 34 })

  const { data: banners = [], isLoading } = useGetBannersBannersGet({
    query: { only_active: true },
  })

  // Автопрокрутка на самоперезапускающемся таймере, а не на setInterval.
  //
  // Интервал тикал независимо от карусели: пролистнёшь стрелкой — и через
  // сотню миллисекунд поверх начатой анимации приходил очередной scrollNext.
  // Две прокрутки накладывались, и это читалось как рывок. Теперь отсчёт
  // начинается заново после каждой остановки, чем бы она ни была вызвана —
  // таймером, стрелкой или пальцем.
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return

    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => emblaApi.scrollNext(), 5000)
    }

    schedule()
    emblaApi.on('settle', schedule)
    emblaApi.on('pointerDown', () => clearTimeout(timer))

    return () => {
      clearTimeout(timer)
      emblaApi.off('settle', schedule)
    }
  }, [emblaApi, banners.length])

  if (isLoading) return <Skeleton className="w-full aspect-[2/1]" />
  if (banners.length === 0) return null

  return (
    <div className="relative w-full">
      <div className="w-full overflow-hidden rounded-base" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => {
            const src = getBannerImage(banner, i18n.language)
            if (!src) return null
            return (
              /* Рамка 2:1 и object-contain вместо 2.5:1 и object-cover:
               присланные баннеры 1000×500, то есть ровно 2:1, и прежняя рамка
               срезала у них верх и низ. object-contain оставлен на случай
               баннера другой формы — лучше поля по краям, чем обрезанный
               текст на картинке. */
              <div key={banner.id} className="flex-[0_0_100%] w-full aspect-[2/1]">
                {/* Внешний адрес подавался в маршрутизатор как внутренний путь и
                    просто не открывался. Внутренние пути по-прежнему идут через
                    маршрутизатор, внешние — обычной ссылкой. */}
                {banner.link ? (
                  banner.link.startsWith('http') ? (
                    <a href={banner.link} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt={banner.name} className="w-full h-full object-contain" />
                    </a>
                  ) : (
                    <Link to={banner.link} rel="noopener noreferrer">
                      <img src={src} alt={banner.name} className="w-full h-full object-contain" />
                    </Link>
                  )
                ) : (
                  <img src={src} alt={banner.name} className="w-full h-full object-contain" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-base"
          >
            <CaretIcon className="rotate-90 w-3 h-3" />
          </button>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-base"
          >
            <CaretIcon className="-rotate-90 w-3 h-3" />
          </button>
        </>
      )}
    </div>
  )
}
