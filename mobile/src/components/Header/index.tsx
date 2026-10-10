import React from 'react'
import Typography from '@/ui/Typography'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ArrowLeft from '@assets/icons/arrow-left.svg'
import { useRouter } from 'expo-router'
import { isColorDark } from '@/utils/processColor'
import { useAdaptiveStatusBar } from '@/hooks/useAdaptiveStatusBar'

type Props = {
  withGoBack?: boolean
  style?: StyleProp<ViewStyle>
  gap?: number
  headerBottom?: React.ReactNode
  headerCenter?: React.ReactNode
  headerRight?: React.ReactNode
  headerLeft?: React.ReactNode
  title?: string
  customTitleColor?: React.ComponentProps<typeof Typography>['color']
  titleIsCentered?: boolean
  backgroundColor?: string
}

const Header = ({
  title,
  withGoBack,
  headerLeft,
  headerRight,
  gap,
  backgroundColor,
  headerCenter,
  headerBottom,
  customTitleColor,
  titleIsCentered = true,
  style,
}: Props) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { theme } = useUnistyles()

  // Шапка была синей по умолчанию: картинка-градиент на весь блок, скруглённый
  // низ и белый текст поверх. На витрине шапка белая (`widgets/Header`,
  // bg-white), и синяя плашка над поиском выглядела чужеродной вставкой,
  // отъедавшей верх экрана. Цвет всё ещё можно задать явно — витрине магазина
  // он нужен (`shop.color`).
  const resolvedBackground = backgroundColor ?? theme.colors.white
  useAdaptiveStatusBar(resolvedBackground)

  const onGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    }
  }

  const titleColor = isColorDark(resolvedBackground) ? 'white' : undefined

  const leftContent =
    headerLeft ||
    (withGoBack ? (
      <Pressable onPress={onGoBack} hitSlop={12}>
        {/* На синей шапке серая стрелка почти не видна — красим её так же,
            как заголовок. */}
        <ArrowLeft style={titleColor === 'white' ? styles.arrowLeftOnDark : styles.arrowLeft} />
      </Pressable>
    ) : null)

  // Экраны вкладок остались без заголовка: их название и так написано в
  // нижней панели. Без этого признака шапка рисовала пустую строку и
  // отъедала полосу белого сверху ни за чем.
  const hasUpSlot = Boolean(leftContent || headerCenter || title || headerRight)

  const titleNode = title ? (
    <Typography
      variant="p2"
      weight="semiBold"
      color={customTitleColor || titleColor}
      numberOfLines={1}
      style={titleIsCentered ? styles.titleCentered : undefined}
    >
      {title}
    </Typography>
  ) : null

  return (
    <>
      <View
        style={[
          styles.container(insets.top, gap, !hasUpSlot && !headerBottom),
          style,
          { backgroundColor: resolvedBackground },
        ]}
      >
        {/* Up Slot */}
        {hasUpSlot && (
          <View style={styles.upSlot}>
            {/* Left */}
            <View style={[styles.sideSlot(!!headerCenter), styles.sideLeft]}>
              {leftContent}
              {!titleIsCentered && !headerCenter && titleNode}
            </View>

            {/* Center */}
            {(headerCenter || (titleIsCentered && title)) && (
              <View style={styles.centerSlot(!!headerCenter)}>
                {headerCenter ? headerCenter : titleNode}
              </View>
            )}

            {/* Right */}
            <View style={[styles.sideSlot(!!headerCenter), styles.sideRight]}>{headerRight}</View>
          </View>
        )}

        {/* Down Slot */}
        {headerBottom}
      </View>
    </>
  )
}

export default Header

const styles = StyleSheet.create((theme) => ({
  container: (hh: number, gap?: number, isEmpty?: boolean) => ({
    // Пустая шапка — только полоса под статус-бар, без собственных отступов.
    paddingTop: hh + (isEmpty ? 0 : theme.spacing(4)),
    paddingBottom: isEmpty ? 0 : theme.spacing(4),
    flexDirection: 'column',
    gap: gap || theme.spacing(6),
    zIndex: 50,
    position: 'relative',
    overflow: 'hidden',
  }),
  upSlot: {
    paddingHorizontal: theme.spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  sideSlot: (hasCenter: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    ...(hasCenter ? {} : { flex: 1, minWidth: 0 }),
  }),

  centerSlot: (isCenterNode: boolean) => ({
    alignItems: 'center',
    justifyContent: 'center',
    ...(isCenterNode ? { flex: 1, flexDirection: 'row' } : { flexShrink: 1 }),
  }),
  sideLeft: {
    justifyContent: 'flex-start',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  titleCentered: {
    textAlign: 'center',
    // Длинное название занимает всю центральную ячейку, и между ним и
    // стрелкой «назад» оставался только зазор строки (12px) — на странице
    // товара они читались как одно слипшееся целое.
    paddingHorizontal: theme.spacing(2),
  },
  arrowLeft: {
    color: theme.colors.passive2,
  },
  arrowLeftOnDark: {
    color: theme.colors.white,
  },
}))
