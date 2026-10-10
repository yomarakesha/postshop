import { langs } from '@/constants/langs'
import i18n from '@/localization'
import useAppStore from '@/store/useAppStore'
import Typography from '@/ui/Typography'
import React, { useState } from 'react'
import { TouchableHighlight, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import splashBackground from '@assets/images/splash-background.png'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import CheckIcon from '@assets/icons/check.svg'

const SelectLanguageScreen = () => {
  const [pressedKey, setPressedKey] = useState<AppLang | null>(null)
  const currentLanguage = useAppStore((s) => s.lang)
  const { t } = useTranslation()

  const handleSelectLanguage = (lang: AppLang) => {
    useAppStore.setState({ lang })
    i18n.changeLanguage(lang)
  }

  return (
    <>
      <StatusBar style="light" />
      {/* Фон рисуется поверх сплошной заливки blueMain: если картинка не
          прогрузится, экран всё равно останется тёмно-синим, а светлый
          статус-бар и белые заголовки — читаемыми. */}
      <View style={styles.root}>
        <Image source={splashBackground} style={styles.backgroundImage} contentFit="cover" />
        <View style={styles.container}>
          <View style={styles.titleWrapper}>
            <Typography variant="h3" weight="bold" color="white" isCentered>
              {t('client.selectLanguage.title')}
            </Typography>
            <Typography variant="p3" weight="regular" color="white" isCentered>
              {t('client.selectLanguage.subtitle')}
            </Typography>
          </View>

          <View style={styles.selector}>
            {langs.map(({ key, value }) => {
              const isPressed = pressedKey === key
              const isSelected = currentLanguage === key

              return (
                <TouchableHighlight
                  key={key}
                  style={styles.item}
                  underlayColor={styles.underlay.color}
                  onShowUnderlay={() => setPressedKey(key)}
                  onHideUnderlay={() => setPressedKey(null)}
                  onPress={() => handleSelectLanguage(key)}
                >
                  <View style={styles.itemContent}>
                    <Typography
                      variant="p2"
                      weight="medium"
                      color={isPressed ? 'white' : undefined}
                    >
                      {value}
                    </Typography>
                    {isSelected && (
                      <CheckIcon width={20} height={20} style={styles.checkIcon(isPressed)} />
                    )}
                  </View>
                </TouchableHighlight>
              )
            })}
          </View>
        </View>
      </View>
    </>
  )
}

export default SelectLanguageScreen

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.blueMain,
  },
  container: {
    flex: 1,
    paddingTop: rt.insets.top + theme.spacing(12),
    paddingBottom: rt.insets.bottom + theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    justifyContent: 'space-between',
    gap: theme.spacing(8),
  },
  titleWrapper: {
    gap: theme.spacing(2),
  },
  selector: {
    width: '100%',
    gap: theme.spacing(2),
  },
  item: {
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
  },
  checkIcon: (isPressed: boolean) => ({
    color: isPressed ? theme.colors.white : theme.colors.blueMain,
  }),
  underlay: {
    color: theme.colors.blueMain,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}))
