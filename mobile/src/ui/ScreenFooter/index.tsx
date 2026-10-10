import React, { ReactNode, useContext } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import useBottomTabBarHeight from '@/hooks/useBottomTabBarHeight'
import { LayoutChangeEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarHeightContext } from 'expo-router/js-tabs'

interface ScreenFooterProps {
  children: ReactNode
  /**
   * Ручной нижний отступ. Если не передан, футер сам добавит системный
   * отступ (жесты/вырез) — но только на экранах вне таб-навигатора, где
   * этот отступ ещё никем не занят.
   */
  bottomOffset?: number
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined
}

/**
 * Сколько нужно добавить снизу, чтобы содержимое футера не наезжало на
 * системную панель жестов. Внутри таб-навигатора этот отступ уже съеден
 * панелью вкладок, поэтому там он равен нулю — иначе получался двойной
 * пустой отступ между кнопкой и вкладками.
 */
const useSystemBottomInset = () => {
  const insets = useSafeAreaInsets()

  // Вне таб-навигатора контекста нет — значение undefined.
  const tabBarHeight = useContext(BottomTabBarHeightContext)

  return tabBarHeight ? 0 : insets.bottom
}

const ScreenFooter = ({ children, bottomOffset, onLayout }: ScreenFooterProps) => {
  const tabBarHeight = useBottomTabBarHeight()
  const systemBottomInset = useSystemBottomInset()
  const extraBottom = bottomOffset ?? systemBottomInset
  const keyboardOffset = extraBottom || tabBarHeight

  return (
    <KeyboardStickyView
      style={styles.container(extraBottom)}
      offset={{ opened: keyboardOffset }}
      onLayout={onLayout}
    >
      {children}
    </KeyboardStickyView>
  )
}

export default ScreenFooter

const styles = StyleSheet.create((theme) => ({
  container: (extraBottom: number) => ({
    padding: theme.spacing(4),
    zIndex: 10,
    paddingBottom: theme.spacing(4) + extraBottom,
    marginTop: 'auto',
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.spacing(6),
    borderTopRightRadius: theme.spacing(6),
    ...theme.shadows.soft,
  }),
}))
