import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { StyleSheet } from 'react-native-unistyles'
import ImageIcon from '@assets/icons/image.svg'
import { getImageUrl } from '@/utils/getImageUrl'

type Props = {
  /**
   * Значение поля `category.image_path` как оно приходит с сервера.
   *
   * Иконки категорий нигде не лежат в ассетах приложения — витрина рисует
   * ровно это поле через getImageUrl (CategoriesSidebar), и приложение
   * делает так же. Копировать картинки в репозиторий не нужно и вредно:
   * админка меняет их без пересборки приложения.
   */
  path?: string | null
  size?: number
}

/**
 * Иконка категории с заглушкой.
 *
 * `image_path` в схеме бэкенда объявлен как `str | None`, то есть у части
 * категорий картинки просто нет. Раньше в этом случае getImageUrl отдавал
 * пустую строку, и на её месте оставалась дыра неизвестного размера — теперь
 * место всегда занято плиткой того же размера с нейтральным значком.
 */
const CategoryIcon = ({ path, size = 44 }: Props) => {
  const uri = path ? getImageUrl(path) : ''
  const [hasFailed, setHasFailed] = useState(false)

  // Список категорий переиспользует ячейки при смене языка и обновлении
  // pull-to-refresh: без сброса одна неудачная загрузка навсегда оставляла
  // бы заглушку даже после того, как картинка появилась.
  useEffect(() => {
    setHasFailed(false)
  }, [uri])

  const showPlaceholder = !uri || hasFailed

  return (
    <View style={[styles.tile(size), showPlaceholder && styles.placeholderTile]}>
      {showPlaceholder ? (
        <ImageIcon
          width={Math.round(size / 2)}
          height={Math.round(size / 2)}
          style={styles.placeholderIcon}
        />
      ) : (
        <Image
          source={uri}
          style={styles.image}
          contentFit="contain"
          transition={150}
          onError={() => setHasFailed(true)}
        />
      )}
    </View>
  )
}

export default CategoryIcon

const styles = StyleSheet.create((theme) => ({
  tile: (size: number) => ({
    width: size,
    height: size,
    borderRadius: theme.radius.small,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  }),
  // Подложка только под заглушкой: у настоящих иконок фон прозрачный, и
  // серый квадрат под ними выглядел бы как рамка.
  placeholderTile: {
    backgroundColor: theme.colors.gray2,
  },
  placeholderIcon: {
    color: theme.colors.passive1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
}))
