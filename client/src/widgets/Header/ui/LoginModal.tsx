import { useEffect, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Trans, useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { PhoneInput } from '#/widgets/Header/ui/PhoneInput'
import { OtpInput } from '#/shared/ui/OtpInput'
import { StepNavigation } from '#/shared/ui/StepNavigation'
import { Input } from '#/shared/ui/Input'
import { Button } from '#/shared/ui/Button'
import { SuccessScreen } from '#/shared/ui/SuccessScreen'
import {
  useRequestOtpAuthOtpRequestPost,
  useUpdateUserUsersUserIdPut,
  useVerifyOtpAuthOtpVerifyPost,
} from '#/shared/openapi/queries'
import { UseMeAuthMeGetKeyFn } from '#/shared/openapi/queries/common'
import { meAuthMeGet } from '#/shared/openapi/requests'
import { useProfileStore } from '#/shared/stores/profileStore'
import { useCartStore } from '#/shared/stores/cartStore'
import { settled } from '#/shared/lib/settled'
import { COUNTRY_CODE } from '#/shared/constants/locale'
import { formatPhone } from '#/shared/utils/phone'

type Step = 'phone' | 'otp' | 'profile' | 'success'

const defaultValues = {
  phone: '',
  otp: '',
  firstName: '',
  lastName: '',
}

interface PendingTokens {
  userId: number
  accessToken: string
  refreshToken: string
}

export const LoginModal = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const modalRef = useRef<ModalRef>(null)
  const loginModalOpen = useProfileStore((s) => s.loginModalOpen)
  const closeLoginModal = useProfileStore((s) => s.closeLoginModal)
  const setTokens = useProfileStore((store) => store.setTokens)
  const setProfile = useProfileStore((store) => store.setProfile)
  const syncCartToBackend = useCartStore((s) => s.syncToBackend)
  const [step, setStep] = useState<Step>('phone')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [pendingTokens, setPendingTokens] = useState<PendingTokens | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (loginModalOpen) {
      modalRef.current?.open()
    }
  }, [loginModalOpen])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCooldown])

  const requestOtp = useRequestOtpAuthOtpRequestPost()
  const verifyOtp = useVerifyOtpAuthOtpVerifyPost()
  const updateUser = useUpdateUserUsersUserIdPut()

  const form = useForm({ defaultValues })

  const completeLogin = async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken)
    await syncCartToBackend()
    const data = await queryClient.fetchQuery({
      queryKey: UseMeAuthMeGetKeyFn(),
      queryFn: () => meAuthMeGet({}).then((res) => res.data),
    })
    if (data) setProfile(data)
    // Раньше окно просто закрывалось, и человек не понимал, вошёл он или нет
    // (C-15). Показываем такое же подтверждение, как после создания магазина.
    setStep('success')
  }

  const reset = () => {
    setStep('phone')
    setErrorKey(null)
    setPendingTokens(null)
    setResendCooldown(0)
    requestOtp.reset()
    verifyOtp.reset()
    updateUser.reset()
    form.reset()
    closeLoginModal()
  }

  const handleBack = () => {
    setErrorKey(null)
    if (step === 'profile') {
      setStep('otp')
      return
    }
    if (step === 'otp') {
      form.setFieldValue('otp', '')
      setStep('phone')
      return
    }
    modalRef.current?.close()
  }

  const submitPhone = async () => {
    setErrorKey(null)
    const phone = form.getFieldValue('phone')
    const result = await settled(
      requestOtp.mutateAsync({
        body: { phone_number: `${COUNTRY_CODE}${phone}` },
      }),
    )
    // Раньше отказ проверялся по result.error, которого при этом клиенте не
    // бывало: шаг переключался как при успехе, и человек ждал код, который
    // никто не отправлял.
    if (!result) {
      setErrorKey('login.errors.general')
      return
    }
    setStep('otp')
    setResendCooldown(60)
  }

  const submitOtp = async () => {
    setErrorKey(null)
    const phone = form.getFieldValue('phone')
    const code = form.getFieldValue('otp')
    const result = await settled(
      verifyOtp.mutateAsync({
        body: { phone_number: `${COUNTRY_CODE}${phone}`, code },
      }),
    )
    // result.error больше не бывает: клиент бросает, а settled отдаёт undefined.
    if (!result?.data) {
      setErrorKey('login.errors.invalidOtp')
      return
    }
    const { id, name, surname, access_token, refresh_token } = result.data
    if (name && surname) {
      completeLogin(access_token, refresh_token)
      return
    }
    setPendingTokens({ userId: id, accessToken: access_token, refreshToken: refresh_token })
    setStep('profile')
  }

  const submitProfile = async () => {
    if (!pendingTokens) return
    setErrorKey(null)
    const firstName = form.getFieldValue('firstName').trim()
    const lastName = form.getFieldValue('lastName').trim()
    const result = await settled(
      updateUser.mutateAsync({
        path: { user_id: pendingTokens.userId },
        body: { name: firstName, surname: lastName },
        headers: { Authorization: `Bearer ${pendingTokens.accessToken}` },
      }),
    )
    if (!result?.data) {
      setErrorKey('login.errors.general')
      return
    }
    completeLogin(pendingTokens.accessToken, pendingTokens.refreshToken)
  }

  const handleNext = () => {
    if (step === 'phone') {
      void submitPhone()
      return
    }
    if (step === 'otp') {
      void submitOtp()
      return
    }
    void submitProfile()
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || requestOtp.isPending) return
    setErrorKey(null)
    form.setFieldValue('otp', '')
    const phone = form.getFieldValue('phone')
    const result = await settled(
      requestOtp.mutateAsync({
        body: { phone_number: `${COUNTRY_CODE}${phone}` },
      }),
    )
    if (!result) {
      setErrorKey('login.errors.general')
      return
    }
    setResendCooldown(60)
  }

  // Заголовок на шаге кода просил номер телефона: инструкция противоречила
  // тому, что человек в этот момент видит и должен ввести.
  const title =
    step === 'profile'
      ? t('login.title.profile')
      : step === 'otp'
        ? t('login.title.otp')
        : t('login.title.phone')

  if (step === 'success') {
    return (
      <Modal ref={modalRef} className="w-137.5 bg-gray2" onClose={reset}>
        <SuccessScreen
          title={t('login.success.title')}
          description={t('login.success.description')}
        >
          <Button className="w-full" onClick={() => modalRef.current?.close()}>
            {t('login.success.close')}
          </Button>
        </SuccessScreen>
      </Modal>
    )
  }

  return (
    <Modal ref={modalRef} className="w-137.5 bg-gray2" onClose={reset}>
      <div className="p-6 flex flex-col gap-6 w-full">
        <h2 className="p1 font-bold text-center">{title}</h2>

        <div className="h-47.5 flex flex-col items-center justify-center">
          {step === 'phone' && (
            <form.Field name="phone">
              {(field) => (
                <PhoneInput value={field.state.value} onChange={field.handleChange} autoFocus />
              )}
            </form.Field>
          )}

          {step === 'otp' && (
            <div className="flex w-full flex-col items-center justify-center gap-3">
              {/* Куда ушёл код — иначе опечатку в номере видно только по тому,
                  что SMS не приходит, а исправить её негде. */}
              <p className="t1 text-passive2">
                {t('login.otpSentTo', {
                  phone: formatPhone(`${COUNTRY_CODE}${form.getFieldValue('phone')}`),
                })}
              </p>
              {/* Поле было нарисовано прозрачным, без рамки и без подсказки: на
                  экране оставалось пустое место, и куда вводить код — непонятно. */}
              <form.Field name="otp">
                {(field) => (
                  <div className="w-full max-w-64 rounded-base border border-border bg-white px-3 py-2.5">
                    <OtpInput
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder={t('login.codePlaceholder')}
                      autoFocus
                    />
                  </div>
                )}
              </form.Field>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || requestOtp.isPending}
                className="p3 text-blue-main font-medium disabled:text-passive1"
              >
                {resendCooldown > 0
                  ? t('login.resendIn', { seconds: resendCooldown })
                  : t('login.resend')}
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="bg-white rounded-xl p-3 flex flex-col gap-2 w-full">
              <form.Field name="firstName">
                {(field) => (
                  <Input
                    placeholder={t('login.firstName')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
              <form.Field name="lastName">
                {(field) => (
                  <Input
                    placeholder={t('login.lastName')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {errorKey && <p className="p3 text-red-500 text-center">{t(errorKey)}</p>}
            <form.Subscribe selector={(state) => state.values}>
              {(values) => (
                <StepNavigation
                  onBack={handleBack}
                  onNext={handleNext}
                  showBack={step !== 'phone'}
                  nextLabel={step === 'profile' ? t('login.save') : t('login.next')}
                  disabled={
                    requestOtp.isPending ||
                    verifyOtp.isPending ||
                    updateUser.isPending ||
                    isStepDisabled(step, values)
                  }
                />
              )}
            </form.Subscribe>
          </div>

          <div className="w-full flex justify-center">
            <p className="t1 text-center text-passive2 w-full">
              <Trans
                i18nKey="login.disclaimer"
                components={{
                  terms: <a href="/terms-of-use" className="text-blue-main font-medium" />,
                }}
              />
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function isStepDisabled(step: Step, values: typeof defaultValues) {
  if (step === 'phone') return values.phone.length !== 8
  if (step === 'otp') return values.otp.length !== 6
  return values.firstName.trim().length === 0 || values.lastName.trim().length === 0
}
