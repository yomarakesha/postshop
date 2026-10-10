import Typography from '@/ui/Typography'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import CaretDownIcon from '@assets/icons/caret-down.svg'

type Props = {
  onPressRegion: () => void
  cityName?: string
}

const HeaderLeft = ({ onPressRegion, cityName }: Props) => {
  return (
    <Pressable style={styles.container} onPress={onPressRegion}>
      {/* Длинное название города переносилось на вторую строку и растягивало
          всю шапку. */}
      <Typography variant={'p2'} weight="medium" numberOfLines={1}>
        {cityName}
      </Typography>
      <CaretDownIcon style={styles.caret} width={16} height={16} />
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  // Выбор города был голым текстом со стрелкой — на белой шапке он не
  // читался как элемент, на который можно нажать. Лёгкая рамка обозначает
  // границы, не перетягивая внимание на себя.
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexShrink: 1,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.base,
    // Высота задана, а не набрана отступами: у выбора города текст крупнее,
    // чем у кнопки «Войти» рядом, и с одинаковыми отступами кнопки выходили
    // разной высоты. Та же высота — у кнопки входа (HeaderRight).
    height: theme.spacing(10),
    paddingHorizontal: theme.spacing(3),
  },
  // Раньше и текст, и стрелка были белыми — шапка под ними была синей.
  caret: {
    color: theme.colors.passive2,
  },
}))

export default HeaderLeft
