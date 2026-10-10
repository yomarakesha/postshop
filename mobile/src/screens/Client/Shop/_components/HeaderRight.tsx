import React, { RefObject } from 'react'
import { Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { isColorDark } from '@/utils/processColor'
import InfoIcon from '@assets/icons/info.svg'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

type Props = {
  ref: RefObject<TrueSheet | null>
  /** Фон шапки — цвет магазина. По нему выбирается цвет иконки. */
  backgroundColor: string
}

const HeaderRight = ({ ref, backgroundColor }: Props) => {
  const { theme } = useUnistyles()
  const onPressInfo = () => {
    ref.current?.present()
  }
  return (
    <Pressable onPress={onPressInfo}>
      <InfoIcon
        color={isColorDark(backgroundColor) ? theme.colors.white : theme.colors.passive2}
        height={24}
        width={24}
      />
    </Pressable>
  )
}

export default HeaderRight
