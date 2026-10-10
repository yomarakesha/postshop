import React from 'react'
import { Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import SearchInput from '@/ui/SearchInput'
import { TFunction } from 'i18next'

type Props = {
  onPressSearch: () => void
  t: TFunction
}

const HeaderBottom = ({ onPressSearch, t }: Props) => {
  return (
    <Pressable onPress={onPressSearch} style={styles.container}>
      <SearchInput pointerEvents="none" editable={false} placeholder={t('common.search')} />
    </Pressable>
  )
}

export default HeaderBottom

const styles = StyleSheet.create((theme) => ({
  container: {
    // По горизонтали — ровно как строка города и аватара выше (upSlot шапки
    // тоже spacing(3)): раньше поиск был на 4px шире с каждой стороны и
    // «вылезал» из-под шапки.
    marginHorizontal: theme.spacing(3),
  },
}))
