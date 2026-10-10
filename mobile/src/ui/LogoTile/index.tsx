import React from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Image, ImageProps } from 'expo-image'
import Typography from '@/ui/Typography'

type Props = {
  image: ImageProps['source']
  onPress?: () => void
  /**
   * Приглушить плитку — у бренда пока нет товаров. Как на витрине: бренд не
   * прячем, а показываем бледным с подписью.
   */
  muted?: boolean
  /** Короткая подпись внизу плитки, например «Скоро». */
  caption?: string
}

const LogoTile = ({ image, onPress, muted = false, caption }: Props) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.imageBox}>
        <Image source={image} style={[styles.image, muted && styles.muted]} contentFit="contain" />
      </View>
      {caption ? (
        <Typography variant="t2" color="secondary" isCentered numberOfLines={1}>
          {caption}
        </Typography>
      ) : null}
    </Pressable>
  )
}

export default LogoTile

const styles = StyleSheet.create((theme, unistyles) => ({
  container: {
    width: (unistyles.screen.width - 44) / 3,
    aspectRatio: 3 / 2,
    borderRadius: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  imageBox: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  muted: {
    opacity: 0.35,
  },
}))
