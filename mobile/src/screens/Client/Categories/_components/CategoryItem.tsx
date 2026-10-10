import React from 'react'
import Typography from '@/ui/Typography'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { useRouter } from 'expo-router'
import CategoryIcon from './CategoryIcon'

type Props = {
  id: string
  label: string
  image?: string
}

/**
 * Карточка категории.
 *
 * Раньше картинка растягивалась на всю карточку (`width/height: 100%`,
 * `position: absolute`, `zIndex: -1`) и лежала под текстом: название читалось
 * поверх иллюстрации, а на Android отрицательный zIndex уводил картинку за
 * фон родителя, и от неё вообще ничего не оставалось. Теперь как на витрине:
 * иконка отдельно, название отдельно.
 */
const CategoryItem = ({ id, label, image }: Props) => {
  const router = useRouter()

  const onPress = () => {
    router.push({
      pathname: '/(client-tabs)/(categories)/[categoryId]',
      params: {
        categoryId: id,
      },
    })
  }

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <CategoryIcon path={image} size={44} />
      {/* Две строки фиксированной высоты. Без этого ряд растягивался по
          самому длинному названию («Computers & laptops» в две строки), а
          сосед с коротким названием тянулся следом — карточки в сетке стояли
          разной высоты, и подпись висела у нижнего края. */}
      <Typography variant="p3" weight="semiBold" numberOfLines={2} style={styles.label}>
        {label}
      </Typography>
    </Pressable>
  )
}

export default CategoryItem

const styles = StyleSheet.create((theme, rn) => ({
  container: {
    // Две колонки с полями spacing(4) по краям и зазором spacing(2) между
    // ними. Раньше ширина считалась от «-44» при отступе только слева, и
    // правое поле выходило шире левого — сетка стояла криво.
    width: (rn.screen.width - theme.spacing(4) * 2 - theme.spacing(2)) / 2,
    minHeight: 112,
    borderRadius: theme.radius.base,
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    backgroundColor: theme.colors.white,
    justifyContent: 'space-between',
  },
  // p3 (16) * 1.3 = 20.8 на строку, две строки.
  label: {
    minHeight: 42,
  },
}))
