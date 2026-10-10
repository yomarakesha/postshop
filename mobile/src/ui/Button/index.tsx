import React, { ReactNode } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import usePressScale from '@/hooks/usePressScale'
import Typography from '../Typography'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type ButtonVariant = 'primary' | 'secondary' | 'error' | 'success' | 'warning'

type Props = {
  onPress?: (...args: any[]) => void
  title?: string
  children?: ReactNode
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  variant: ButtonVariant
}

/** Единая высота кнопок во всём приложении (и комфортная зона нажатия). */
const BUTTON_MIN_HEIGHT = 48

const Button = ({ onPress, title, children, disabled = false, style, variant }: Props) => {
  // Раньше цвета брались через UnistylesRuntime.getTheme() прямо в рендере:
  // такой вызов не подписан на смену темы, и при переключении светлая/тёмная
  // кнопки оставались с прежним фоном. Варианты Unistyles реактивны.
  styles.useVariants({ variant, disabled })

  // Отклик на нажатие общий для кнопок и для собранных вручную Pressable
  // (счётчик «+/−» на странице товара) — реализация одна на всех.
  const { pressStyle, onPressIn, onPressOut } = usePressScale(disabled)

  const textColor = disabled ? 'disabled' : variant === 'secondary' ? undefined : 'white'

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.container, style, pressStyle]}
    >
      {children || (
        <Typography variant="p3" weight="medium" color={textColor} numberOfLines={1} isCentered>
          {title}
        </Typography>
      )}
    </AnimatedPressable>
  )
}

export default Button

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: BUTTON_MIN_HEIGHT,
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    // Радиус — из темы, а не «три отступа»: см. theme.radius.
    borderRadius: theme.radius.base,
    flexGrow: 1,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.blueMain },
        secondary: { backgroundColor: theme.colors.gray2 },
        error: { backgroundColor: theme.colors.failure },
        success: { backgroundColor: theme.colors.success },
        warning: { backgroundColor: theme.colors.warning },
        default: { backgroundColor: theme.colors.blueMain },
      },
      disabled: {
        true: { backgroundColor: theme.colors.gray2 },
      },
    },
  },
}))
