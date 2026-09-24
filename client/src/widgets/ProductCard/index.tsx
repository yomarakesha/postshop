import { motion } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CardCartButton } from './ui/CardCartButton'
import type { ReactNode } from 'react'
import { HeartIcon } from '@/shared/assets/icons/heart'
import { cn } from '@/shared/utils/cn'
import { useFavoritesContext } from '#/app/providers/FavoritesProvider'
import { FALLBACK_CURRENCY } from '#/shared/constants/locale'
import { RatingStars } from '#/shared/ui/RatingStars'

interface ProductCardProps {
  productId?: number
  images: Array<string>
  price: number
  oldPrice?: number
  name: string
  store: string
  discount?: number
  outOfStock?: boolean
  /**
   * Город, из которого приедет товар. Задаётся только когда он отличается от
   * города покупателя: поиск больше не прячет товары других городов, и без
   * этой отметки человек не отличил бы местный товар от привозного.
   */
  deliveryFrom?: string
  inReview?: boolean
  currencyCode?: string
  to?: string
  storeTo?: string
  hideFavorite?: boolean
  /** Витрина продавца: свои товары не покупают, кнопка корзины там не нужна. */
  hideCart?: boolean
  /** Товар отклонён модератором. */
  declined?: boolean
  /** Причина отказа от модератора: продавец иначе не узнаёт, что исправить. */
  moderationComment?: string | null
  /** Товар снят с продажи самим продавцом (в отличие от «нет в наличии»). */
  hiddenFromSale?: boolean
  /** Действия продавца под карточкой: снять с продажи, вернуть. */
  action?: ReactNode
  /** Остаток на складе — только там, где магазин ведёт складской учёт.
      Узлом, а не строкой: в своём списке продавец правит его прямо здесь. */
  stock?: ReactNode
  /** Средняя оценка по подтверждённым отзывам. Приходит строкой (Decimal). */
  rating?: number | string | null
  /** Сколько оценок. Ноль означает «отзывов нет» — звёзды тогда не рисуем. */
  ratingCount?: number
}

/**
 * Цена в карточке — без копеек.
 *
 * В карточке цена стоит рядом со старой ценой, и копейки съедали место, из-за
 * которого строка переносилась. Округление здесь только для показа: расчёт
 * корзины, оформления и заказа идёт по точной цене, и на странице товара она
 * тоже точная. Округляем к ближайшему, а не отбрасываем: отбрасывание всегда
 * показывало бы цену ниже настоящей.
 */
const roundPrice = (value: number) => Math.round(value)

/**
 * Метка поверх фотографии (скидка, «нет в наличии», город доставки).
 *
 * `truncate` с `min-w-0`: город может быть длинным, а места слева от кнопки
 * корзины в узкой колонке немного. Раньше метка просто вылезала за карточку.
 */
const BADGE = 'min-w-0 truncate rounded-base px-1.5 py-0.5 t2 font-semibold text-white'

export const ProductCard = ({
  productId,
  images,
  price,
  oldPrice,
  name,
  store,
  discount,
  outOfStock,
  deliveryFrom,
  inReview,
  currencyCode = FALLBACK_CURRENCY,
  to = '/',
  storeTo = '/',
  hideFavorite = false,
  hideCart = false,
  declined = false,
  moderationComment,
  hiddenFromSale = false,
  action,
  stock,
  rating,
  ratingCount = 0,
}: ProductCardProps) => {
  const { t } = useTranslation()
  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const liked = productId ? isFavorite(productId) : false
  const [emblaRef] = useEmblaCarousel({ loop: true })

  const handleImageUrl = (url: string) => {
    if (!url.startsWith('http')) {
      return import.meta.env.VITE_BACKEND_API_URL + '/' + url
    } else {
      return url
    }
  }

  return (
    <div
      /* Отклик на наведение — правило .product-card в styles.css: карточка не
         отзывалась никак, только кнопка внутри неё, и сетка каталога читалась
         плоским списком. */
      className={`product-card w-full h-full bg-white rounded-xl shadow-base overflow-hidden flex flex-col${
        inReview ? ' opacity-75' : ''
      }`}
    >
      {/* pointer-events-none здесь глушил всю карточку: товар на модерации
          нельзя было открыть, хотя правка на сервере разрешена — продавец не
          мог ни поправить его, ни посмотреть, что отправил. */}
      <Link to={to} className="relative block">
        <div className="relative w-full rounded-xl overflow-hidden bg-gray-50" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative">
                <img
                  src={handleImageUrl(src)}
                  alt={name}
                  className="w-full aspect-4/4 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Нижний ряд поверх фотографии: метки слева, корзина справа.
            Раньше метки и кнопка стояли каждая своим absolute у нижнего края и
            ничего не знали друг о друге. В узкой колонке (две на телефоне,
            четыре на ноутбуке) счётчик «− 1 +» шире оставшегося места и наезжал
            на скидку: от «-10%» была видна половина. Один flex-ряд разводит их
            по краям при любой ширине — кнопка держит свой размер, метки ужимаются
            и переносятся. Метки друг друга тоже больше не перекрывают: «нет в
            наличии» и скидка раньше лежали в одной точке. */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-end gap-1">
            {discount && <span className={cn(BADGE, 'bg-failure')}>-{discount}%</span>}

            {outOfStock && (
              <span className={cn(BADGE, 'bg-failure')}>{t('products.outOfStock')}</span>
            )}

            {deliveryFrom && !outOfStock && (
              <span className={cn(BADGE, 'bg-blue-main')}>{deliveryFrom}</span>
            )}

            {hiddenFromSale && (
              <span className={cn(BADGE, 'bg-passive2')}>{t('products.hidden')}</span>
            )}
          </div>

          {productId !== undefined && !hideCart && !inReview && !outOfStock && (
            <CardCartButton productId={productId} />
          )}
        </div>

        {!hideFavorite && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (productId) toggleFavorite(productId)
            }}
            whileTap={{ scale: 0.8 }}
            className="absolute top-3 right-3"
          >
            <motion.div
              initial={false}
              animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <HeartIcon filled={liked} />
            </motion.div>
          </motion.button>
        )}

        {declined && (
          <span className="absolute top-1 right-1 bg-failure text-white t2 font-semibold px-1.5 py-0.5 rounded-base">
            {t('products.declined')}
          </span>
        )}

        {inReview && (
          <span className="absolute top-1 right-1 bg-amber-500 text-white t2 font-semibold px-1.5 py-0.5 rounded-base">
            {t('products.inReview')}
          </span>
        )}
      </Link>

      <div className="flex flex-col p-2 flex-1">
        <Link to={to} className="flex-1">
          {/* whitespace-nowrap на обеих ценах: со скидкой в строке две цены,
              и на 16px они не помещались в карточку — цена переносилась на
              вторую строку и разрывалась между числом и валютой.

              flex-wrap к нему в пару: nowrap запрещает перенос внутри цены, но
              заодно не давал строке ужаться, и пара «16650 tmt 18500 tmt» в
              узкой колонке вылезала за карточку — старую цену срезало по краю
              («18500 t»). Теперь не влезающая старая цена уходит на свою
              строку целиком, а не обрезается. */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            {/* То же, что на странице товара: красный только при скидке. */}
            <span
              className={cn(
                't1 font-bold whitespace-nowrap',
                discount ? 'text-failure' : 'text-text',
              )}
            >
              {roundPrice(price)} {currencyCode}
            </span>
            {oldPrice && (
              <span className="r text-passive2 line-through whitespace-nowrap">
                {roundPrice(oldPrice)} {currencyCode}
              </span>
            )}
          </div>
          <p className="t1 caption-2-lines mt-1.5 line-clamp-2">{name}</p>
          {/* Без отзывов звёзд нет: пять пустых звёзд читаются как «оценили на
              ноль», хотя товар просто новый. */}
          {ratingCount > 0 && rating != null && (
            <RatingStars value={Number(rating)} count={ratingCount} className="mt-1.5" />
          )}
        </Link>
        {store && (
          <Link to={storeTo} className="t1 text-blue-main font-bold mt-2">
            {store}
          </Link>
        )}

        {/* Комментарий модератора не выводился нигде: товар отклоняли, а
            продавец не узнавал, что именно исправить. */}
        {moderationComment && (
          <p className="t2 text-failure mt-2 whitespace-pre-line">{moderationComment}</p>
        )}

        {stock && <div className="t2 text-passive2 mt-1">{stock}</div>}

        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}
