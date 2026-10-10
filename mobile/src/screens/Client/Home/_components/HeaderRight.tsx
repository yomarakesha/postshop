import { Pressable, View } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native-unistyles'
import Typography from '@/ui/Typography'
import { useRouter } from 'expo-router'
import { useUserStore } from '@/store/useUserStore'
import CircleUser from '@assets/icons/circle-user-round.svg'
import StoreIcon from '@assets/icons/store.svg'
import useAppStore from '@/store/useAppStore'
import useShopStore from '@/store/useShopStore'
import { TFunction } from 'i18next'

type Props = {
  onPressShop: () => void
  onPressProfile: () => void
  onPressAuth: () => void
  hasAnyShop: boolean
  user: User.Item | null
  t: TFunction
}

const HeaderRight = ({ onPressShop, onPressProfile, onPressAuth, hasAnyShop, t }: Props) => {
  const user = useUserStore((s) => s.user)

  if (user) {
    return (
      <View style={styles.actionsWrapper}>
        {hasAnyShop && (
          <Pressable onPress={onPressShop} style={styles.shopButton}>
            <StoreIcon width={22} height={22} style={styles.iconColor} />
          </Pressable>
        )}
        <Pressable onPress={onPressProfile} style={styles.profile}>
          <Typography weight="medium">
            {user.name?.toLocaleLowerCase().charAt(0).toUpperCase()}
          </Typography>
        </Pressable>
      </View>
    )
  }

  return (
    <Pressable onPress={onPressAuth} style={styles.signInButton}>
      <Typography variant="t1" color="white" weight="bold">
        {t('common.logIn')}
      </Typography>
    </Pressable>
  )
}

export default HeaderRight

const styles = StyleSheet.create((theme) => ({
  // Кнопка входа была белой плашкой на синей шапке. На белой шапке она
  // исчезала целиком — теперь это синяя кнопка, как основные кнопки витрины.
  signInButton: {
    // Одна высота с выбором города слева (HeaderLeft): отступами их было не
    // выровнять — у кнопок разный размер текста.
    height: theme.spacing(10),
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(3),
    backgroundColor: theme.colors.blueMain,
    borderRadius: theme.radius.base,
  },
  actionsWrapper: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Размер и скругление — из темы: было 33px и «магическая» 999, из-за чего
  // кнопка магазина и аватар считались по разным правилам и не совпадали.
  shopButton: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    borderColor: theme.colors.stroke,
    borderWidth: 2,
  },
  profile: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconColor: {
    color: theme.colors.passive2,
  },
}))
