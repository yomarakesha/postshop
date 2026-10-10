import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import MaskInput from 'react-native-mask-input'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import ArrowLeft from '@assets/icons/arrow-left.svg'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Button from '@/ui/Button'
import ScreenFooter from '@/ui/ScreenFooter'
import Typography from '@/ui/Typography'
import { authApi } from '@/api/authApi'
import ErrorAlert from '@/utils/errorAlert'
import { useTranslation } from 'react-i18next'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

type FormValues = {
  phoneNumber: string
}

const AuthScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useUnistyles()
  const [tooManyRequestsError, setTooManyRequestsError] = useState(false)
  const authMutation = authApi.useLogin()
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight()
  const { t } = useTranslation()

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      phoneNumber: '',
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const phoneNumber = `+993${data.phoneNumber}`
    try {
      await authMutation.mutateAsync({
        phone_number: phoneNumber,
      })
      router.push({
        pathname: '/(auth)/verify',
        params: {
          phoneNumber,
        },
      })
    } catch (e: any) {
      if (!!e.response && e.response.status == 429) {
        setTooManyRequestsError(true)
      } else {
        ErrorAlert(t, e)
      }
    }
  }

  const onGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  return (
    <>
      <KeyboardAwareScrollView
        // Нажатие на кнопку при открытой клавиатуре срабатывает сразу. По
        // умолчанию («never») первое нажатие только закрывало клавиатуру, и
        // «Далее» / «Подтвердить» приходилось нажимать дважды.
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container(insets.top)}
        bottomOffset={footerHeight}
      >
        <View style={styles.content}>
          <Typography variant="p2" weight="bold" color="secondary" isCentered>
            {t('auth.login.headline')}
          </Typography>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              {/* Код страны — тем же кеглем, что и сам номер. Он был набран
                  h2 (20), а цифры — 30-м: в одной строке это читалось как две
                  разные надписи. */}
              <Typography variant="p1" weight="medium">
                +993
              </Typography>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: true,
                  minLength: 8,
                  maxLength: 8,
                }}
                render={({ field: { onChange, value } }) => (
                  <MaskInput
                    mask={[/\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/]}
                    value={value}
                    onChangeText={(_, unmasked) => {
                      setTooManyRequestsError(false)
                      onChange(unmasked)
                    }}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder=""
                    placeholderTextColor={theme.colors.passive1}
                    // @ts-expect-error no-type
                    includeFontPadding={false}
                    autoFocus
                    maxLength={11}
                  />
                )}
              />
            </View>
            {tooManyRequestsError ? (
              <Typography variant="p3" color="error" weight="bold" isCentered>
                {t('auth.login.tryAgain')}
              </Typography>
            ) : null}
          </View>
        </View>
        <ScreenFooter onLayout={onFooterLayout}>
          <View style={styles.footer}>
            <View style={styles.buttonsContainer}>
              <Pressable
                style={styles.goBackButton}
                onPress={onGoBack}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
              >
                <ArrowLeft style={styles.arrowLeft} />
              </Pressable>
              <Button
                variant="primary"
                disabled={!isValid || authMutation.isPending}
                title={t('common.next')}
                onPress={handleSubmit(onSubmit)}
              >
                {authMutation.isPending ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : undefined}
              </Button>
            </View>
            <Typography variant="t1" color="tertiary" weight="medium" isCentered>
              {t('common.authAgreement.prefix')}
              <Typography
                variant="t1"
                color="main"
                weight="medium"
                onPress={() => router.push('/(legal)/terms-of-use')}
              >
                {t('common.authAgreement.terms')}
              </Typography>
              {t('common.authAgreement.and')}
              <Typography
                variant="t1"
                color="main"
                weight="medium"
                onPress={() => router.push('/(legal)/privacy-policy')}
              >
                {t('common.authAgreement.privacy')}
              </Typography>
              {t('common.authAgreement.suffix')}
            </Typography>
          </View>
        </ScreenFooter>
      </KeyboardAwareScrollView>
    </>
  )
}

export default AuthScreen

const styles = StyleSheet.create((theme) => ({
  container: (hh: number) => ({
    flexGrow: 1,
    paddingTop: hh + theme.spacing(6),
  }),
  // Заголовок и номер — один смысловой блок, центрированный в свободном
  // пространстве над футером. Раньше заголовок был прибит к верху экрана,
  // а поле отстояло от него на фиксированные 120px: на высоком экране между
  // ними и до кнопки оставались две огромные пустоты.
  // Блок стоял по центру свободной высоты: на телефоне это давало огромные
  // пустоты сверху и снизу, а поле терялось где-то посередине экрана.
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(8),
    gap: theme.spacing(6),
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'GoogleSans-Medium',
    color: theme.colors.text,
    padding: 0,
    includeFontPadding: false,
  },
  // Поле было нарисовано «голым»: ни рамки, ни подложки — «+993» и цифры
  // читалось как обычная надпись, и куда нажимать, понять было нельзя.
  // Оформлено как остальные поля приложения: белая подложка, рамка, скругление.
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
  },
  inputWrapper: {
    gap: theme.spacing(4),
  },
  arrowLeft: {
    color: theme.colors.blueMain,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing(4),
  },
  goBackButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blue2,
  },
  footer: {
    gap: theme.spacing(4),
  },
}))
