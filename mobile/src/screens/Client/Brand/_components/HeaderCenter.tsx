import React from 'react'
import Typography from '@/ui/Typography'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Image } from 'expo-image'

type Props = {
  image: string
}

const HeaderCenter = ({ image }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Image source={{ uri: image }} contentFit="contain" style={styles.image} />
    </View>
  )
}

export default HeaderCenter

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    aspectRatio: 50 / 21,
  },
}))
