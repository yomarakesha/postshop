import React from 'react'
import Typography from '@/ui/Typography'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Image } from 'expo-image'
import { isColorDark } from '@/utils/processColor'

type Props = {
  logo: string
  name: string
  /** Фон шапки — цвет магазина. По нему выбирается цвет названия. */
  backgroundColor: string
}

const HeaderLeft = ({ logo, name, backgroundColor }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={{ uri: logo }} style={styles.logo} contentFit="contain" />
      </View>
      <View style={styles.infoContainer}>
        {/* Название было наглухо белым. У магазина без своего цвета шапка
            белая — и название пропадало на ней целиком. */}
        <Typography
          variant="p1"
          weight="semiBold"
          color={isColorDark(backgroundColor) ? 'white' : undefined}
        >
          {name}
        </Typography>
      </View>
    </View>
  )
}

export default HeaderLeft

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    gap: theme.spacing(4),
    flex: 1,
  },
  logoContainer: {
    width: 95,
    height: 55,
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}))
