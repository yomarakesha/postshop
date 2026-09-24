import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useRequestPhoneChangeAuthPhoneChangeRequestPost,
  useVerifyPhoneChangeAuthPhoneChangeVerifyPost,
} from '#/shared/openapi/queries'
import { Button } from '#/shared/ui/Button'
import { OtpInput } from '#/shared/ui/OtpInput'
import { PhoneNumberInput } from '#/shared/ui/PhoneNumberInput'
import { COUNTRY_CODE } from '#/shared/constants/locale'
import { formatPhone } from '#/shared/utils/phone'
import { settled } from '#/shared/lib/settled'
import { getErrorMessage } from '#/shared/lib/apiError'

/** Столько же ждёт бэкенд между отправками кода. */
const RESEND_SECONDS = 60
const LOCAL_LENGTH = 8

interface Props {
  /** Текущий номер, чтобы человек видел, что меняет. */
  phone: string | null | undefined
  /** Вызывается после успешной смены: профиль в сторе надо обновить. */
  onChanged: (phone: string) => void
}

/**
 * Смена своего номера телефона.
 *
 * Номер — это логин: вход по SMS идёт по нему. Поменять его было негде, а через
 * правку профиля он менялся вообще без подтверждения — то есть чужим токеном
 * можно было навсегда забрать вход у владельца. Теперь бэкенд требует код, и
 * код приходит на НОВЫЙ номер: подтвердить надо, что новый номер твой, иначе
 * пользователь уведёт аккаунт на чужой или неверно набранный номер и потеряет
 * вход сам.
 */
export const PhoneChangeCard = ({ phone, onChanged }: Props) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [local, setLocal] = useState('')
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const fullPhone = `${COUNTRY_CODE}${local}`

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const onRequestError = (error: unknown) => {
    const status = (error as { status?: number } | undefined)?.status
    // 400 здесь всегда про номер: он уже свой либо занят другим аккаунтом.
    if (status === 400) {
      toast.error(t('phoneChange.unavailable'))
      return
    }
    if (status === 429) {
      toast.error(t('phoneChange.tooOften'))
      setCooldown(RESEND_SECONDS)
      return
    }
    toast.error(getErrorMessage(error))
  }

  const requestChange = useRequestPhoneChangeAuthPhoneChangeRequestPost(undefined, {
    onError: onRequestError,
  })
  const verifyChange = useVerifyPhoneChangeAuthPhoneChangeVerifyPost(undefined, {
    onError: (error) => {
      const status = (error as { status?: number } | undefined)?.status
      if (status === 401) {
        toast.error(t('phoneChange.wrongCode'))
        return
      }
      if (status === 400) {
        toast.error(t('phoneChange.unavailable'))
        return
      }
      toast.error(getErrorMessage(error))
    },
  })

  const sendCode = async () => {
    if (local.length !== LOCAL_LENGTH) {
      toast.error(t('phoneChange.phoneIncomplete'))
      return
    }
    const result = await settled(requestChange.mutateAsync({ body: { new_phone: fullPhone } }))
    if (result?.data) {
      toast.success(t('phoneChange.codeSent'))
      setStep('code')
      setCooldown(RESEND_SECONDS)
    }
  }

  const confirm = async () => {
    const result = await settled(verifyChange.mutateAsync({ body: { new_phone: fullPhone, code } }))
    if (result?.data) {
      toast.success(t('phoneChange.changed'))
      onChanged(fullPhone)
      setStep('phone')
      setLocal('')
      setCode('')
      setCooldown(0)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-base">
      <div>
        <h2 className="p2 font-bold">{t('phoneChange.title')}</h2>
        <p className="t1 mt-1 text-passive2">
          {phone
            ? t('phoneChange.current', { phone: formatPhone(phone) })
            : t('phoneChange.noneYet')}
        </p>
      </div>

      {step === 'phone' && (
        <>
          <PhoneNumberInput
            label={t('phoneChange.newPhone')}
            required
            value={local}
            onChange={(e) => setLocal(e.target.value.replace(/\D/g, '').slice(0, LOCAL_LENGTH))}
          />
          <p className="t2 text-passive2">{t('phoneChange.hint')}</p>
          <div className="flex">
            <Button disabled={requestChange.isPending} onClick={sendCode}>
              {requestChange.isPending ? t('phoneChange.sending') : t('phoneChange.sendCode')}
            </Button>
          </div>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="p3">{t('phoneChange.codeSentTo', { phone: formatPhone(fullPhone) })}</p>
          <div className="rounded-base border border-border px-3 py-2">
            <OtpInput
              value={code}
              onChange={setCode}
              placeholder={t('login.codePlaceholder')}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={verifyChange.isPending || code.length < 4} onClick={confirm}>
              {verifyChange.isPending ? t('phoneChange.confirming') : t('phoneChange.confirm')}
            </Button>
            <Button
              variant="tertiary"
              disabled={cooldown > 0 || requestChange.isPending}
              onClick={sendCode}
            >
              {cooldown > 0 ? t('login.resendIn', { seconds: cooldown }) : t('login.resend')}
            </Button>
            <Button
              variant="tertiary"
              onClick={() => {
                setStep('phone')
                setCode('')
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
