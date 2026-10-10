import React from 'react'
import Typography from '@/ui/Typography'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import Header from '@/components/Header'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import HeroBecomeSeller from '@assets/images/hero-become-seller.png'
import Button from '@/ui/Button'
import { useRouter } from 'expo-router'
import { useUserStore } from '@/store/useUserStore'
import { useConfirmationModal } from '@/store/useConfirmationModal'
import LogInIcon from '@assets/icons/log-in.svg'
import { useTranslation } from 'react-i18next'

const BecomeSellerOnboardingScreen = () => {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const { theme } = useUnistyles()
  const { t } = useTranslation()
  const handleOpenAuth = () => {
    if (!user) {
      useConfirmationModal.setState({
        isOpen: true,
        title: t('client.becomeSellerOnboarding.loginRequired.title'),
        type: 'info',
        Icon: LogInIcon,
        okTitle: t('common.close'),
        description: t('client.becomeSellerOnboarding.loginRequired.description'),
        onConfirm: undefined,
      })

      return
    }
    router.push('/(become-seller)')
  }

  return (
    <View style={styles.root}>
      {/* Градиент лежит под всем экраном, включая шапку: раньше шапка была
          белой и на синем фоне читалась как оторванная белая полоса. */}
      <LinearGradient
        colors={[theme.colors.blueMain, theme.colors.blue5]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <Header
        title={t('postshopSeller')}
        withGoBack
        // Прозрачная шапка = продолжение градиента, без стыка и скруглений.
        // Заголовок и стрелка при таком фоне рисуются белыми.
        backgroundColor="transparent"
      />

      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            source={HeroBecomeSeller}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        </View>
        <View style={styles.contenContainer}>
          <View style={styles.textContainer}>
            <Typography color="white" variant="h3" weight="bold">
              {t('client.becomeSellerOnboarding.title')}
            </Typography>
            <Typography color="white" variant="p2" weight="bold">
              {t('client.becomeSellerOnboarding.subtitle')}
            </Typography>
            <Typography variant="p3" color="white">
              {t('client.becomeSellerOnboarding.description')}
            </Typography>
          </View>
          <Button
            title={t('client.becomeSellerOnboarding.button')}
            onPress={handleOpenAuth}
            variant="primary"
          />
        </View>
      </View>
    </View>
  )
}

export default BecomeSellerOnboardingScreen

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    flex: 1,
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
    paddingHorizontal: theme.spacing(6),
    gap: theme.spacing(8),
  },
  // Картинка занимает свободную высоту и центрируется в ней: раньше её
  // фиксированные пропорции оставляли сверху пустое синее поле, а текст
  // прижимался к нижнему краю экрана.
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contenContainer: {
    gap: theme.spacing(6),
  },
  textContainer: {
    gap: theme.spacing(4),
  },
}))
