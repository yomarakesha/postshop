import React, { useEffect } from 'react'
import Typography from '@/ui/Typography'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import noInternetImg from '@assets/images/no-internet.png'
import { Image } from 'expo-image'
import Button from '@/ui/Button'
import { TFunction } from 'i18next'
import RefreshIcon from '@assets/icons/refresh.svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'

type Props = {
  onRetry: () => void
  isLoading?: boolean
  t: TFunction
}

const InernetError = ({ onRetry, isLoading, t }: Props) => {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false,
      )
    } else {
      cancelAnimation(rotation)
      rotation.value = 0
    }
  }, [isLoading, rotation])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={noInternetImg} style={styles.image} contentFit="contain" />
        <Typography variant="p2" weight="semiBold">
          {t('networkError.title')}
        </Typography>
        <Typography variant="p3" color="secondary" isCentered>
          {t('networkError.description')}
        </Typography>
        <Button onPress={onRetry} variant="primary" style={styles.button}>
          <Typography variant="p3" weight="medium" color="white">
            {t('common.retry')}
          </Typography>
          <Animated.View style={iconStyle}>
            <RefreshIcon width={20} height={20} color="white" />
          </Animated.View>
        </Button>
      </View>
    </View>
  )
}

export default InernetError

const styles = StyleSheet.create((theme) => ({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.gray2,
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 40,
    transform: [{ translateY: 50 }],
  },
  image: {
    width: 180,
    height: 90,
  },
  button: {
    width: '60%',
    flexGrow: 0,
    marginTop: 30,
    flexDirection: 'row',
    gap: theme.spacing(2),
    justifyContent: 'center',
  },
}))
