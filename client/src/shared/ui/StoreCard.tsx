import { Link } from '@tanstack/react-router'

interface Props {
  name: string
  image?: string
  to: string
  /**
   * Подпись под изображением. На странице брендов её убрали: логотип и так
   * содержит название. У магазинов подпись нужна — там на карточке фотография
   * витрины, по которой магазин не опознать.
   */
  showName?: boolean
}

export const StoreCard = ({ name, image, to, showName = true }: Props) => {
  // Без картинки карточка без подписи была бы пустым белым квадратом,
  // поэтому в этом случае название показываем всегда.
  const withName = showName || !image

  return (
    <Link to={to} className="flex flex-col items-center gap-2 rounded-base bg-white px-5 py-3">
      {/* Раньше карточка была квадратной целиком, а картинка растягивалась на
          остаток высоты (flex-1). Из-за этого длинное название, перенесённое на
          вторую строку, забирало высоту у картинки — и в одном ряду картинки
          выходили разного размера. Теперь квадрат задан самой картинке, а
          подписи отведено постоянное место под две строки. */}
      <div className="aspect-square w-full">
        <img src={image} alt={withName ? '' : name} className="size-full object-contain" />
      </div>
      {withName && (
        <span className="t1 caption-2-lines line-clamp-2 text-center font-medium">{name}</span>
      )}
    </Link>
  )
}
