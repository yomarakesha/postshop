import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '#/shared/utils/cn'
import { HeartIcon } from '#/shared/assets/icons/heart'
import { useFavoritesContext } from '#/app/providers/FavoritesProvider'

interface ImageGalleryProps {
  images: Array<string>
  productId?: number
}

export const ImageGallery = ({ images, productId }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { isFavorite, toggleFavorite } = useFavoritesContext()
  const liked = productId ? isFavorite(productId) : false

  if (images.length === 0) {
    return (
      <div className="flex flex-1">
        <div className="aspect-4/5 w-full rounded-base bg-gray-100" />
      </div>
    )
  }

  const thumbnails = images.length > 1 && (
    <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => setSelectedIndex(index)}
          className={cn(
            'shrink-0 w-14 h-14 lg:w-18.75 lg:h-20 rounded-base overflow-hidden border',
            selectedIndex === index ? 'border-blue-main' : 'border-transparent',
          )}
        >
          <img
            src={image}
            alt={`Product thumbnail ${index + 1}`}
            className="size-full object-cover"
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-1 flex-col lg:flex-row gap-2 lg:gap-4">
      <div className="relative flex-1 lg:order-last order-first">
        {/* Было p-4 плюс object-contain: картинка вписывалась внутрь отступов и
            вокруг неё оставалась белая рамка, тем более широкая, чем сильнее
            пропорции фото отличались от пропорций контейнера. Теперь фото
            занимает контейнер целиком, скругление держит overflow-hidden. */}
        <div className="h-72 lg:h-120 overflow-hidden rounded-base border border-stroke shadow-base">
          <img src={images[selectedIndex]} alt="Product" className="size-full object-cover" />
        </div>
        <motion.button
          onClick={() => productId && toggleFavorite(productId)}
          whileTap={{ scale: 0.8 }}
          className="absolute top-3 right-3"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <HeartIcon filled={liked} />
          </motion.div>
        </motion.button>
      </div>

      {thumbnails && <div className="lg:order-first order-last">{thumbnails}</div>}
    </div>
  )
}
