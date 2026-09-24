import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useChangePasswordAuthPasswordChangePost } from '#/shared/openapi/queries'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { settled } from '#/shared/lib/settled'
import { getErrorMessage } from '#/shared/lib/apiError'

/** Столько же требует бэкенд (Password255), незачем узнавать это отказом. */
const MIN_LENGTH = 8

interface Props {
  /** Есть ли у учётной записи пароль: у входивших только по SMS его нет. */
  hasPassword: boolean
}

/**
 * Смена своего пароля.
 *
 * Экрана не было вовсе: пароль ставился только запросом или сотрудником, а
 * покупатель со входом по SMS не мог задать себе пароль, даже открыв магазин.
 *
 * Текущий пароль спрашивается всегда, когда он есть, — так требует бэкенд, и
 * причина та же: без него украденный токен означал бы захват аккаунта навсегда.
 * У учётной записи без пароля подтверждать нечем, поэтому поле скрыто, а
 * заголовок говорит, что пароль задаётся впервые.
 */
export const PasswordChangeCard = ({ hasPassword }: Props) => {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')

  // Свой onError: у двух отказов этого метода есть понятная причина, и её
  // стоит назвать по-русски. Общий обработчик показал бы «Доступ запрещён» с
  // английским уточнением от сервера — по нему не догадаться, что достаточно
  // перенабрать текущий пароль. Заданный onError общий обработчик отключает.
  const changePassword = useChangePasswordAuthPasswordChangePost(undefined, {
    onError: (error) => {
      const status = (error as { status?: number } | undefined)?.status
      if (status === 403) {
        toast.error(t('passwordChange.currentWrong'))
        return
      }
      if (status === 400) {
        toast.error(t('passwordChange.sameAsCurrent'))
        return
      }
      toast.error(getErrorMessage(error))
    },
  })

  const reset = () => {
    setCurrent('')
    setNext('')
    setRepeat('')
  }

  const submit = async () => {
    if (hasPassword && !current) {
      toast.error(t('passwordChange.currentRequired'))
      return
    }
    if (next.length < MIN_LENGTH) {
      toast.error(t('passwordChange.tooShort', { count: MIN_LENGTH }))
      return
    }
    if (next !== repeat) {
      // Опечатку во втором поле надо поймать здесь: бэкенд второго поля не
      // видит и молча поставит пароль, который пользователь не набирал.
      toast.error(t('passwordChange.mismatch'))
      return
    }

    const result = await settled(
      changePassword.mutateAsync({
        body: {
          current_password: hasPassword ? current : null,
          new_password: next,
        },
      }),
    )

    if (result?.data) {
      toast.success(t(hasPassword ? 'passwordChange.changed' : 'passwordChange.created'))
      reset()
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-base">
      <div>
        <h2 className="p2 font-bold">
          {t(hasPassword ? 'passwordChange.title' : 'passwordChange.titleFirst')}
        </h2>
        <p className="t1 mt-1 text-passive2">
          {t(hasPassword ? 'passwordChange.subtitle' : 'passwordChange.subtitleFirst')}
        </p>
      </div>

      {hasPassword && (
        <Input
          type="password"
          autoComplete="current-password"
          label={t('passwordChange.current')}
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      )}
      <Input
        type="password"
        autoComplete="new-password"
        label={t('passwordChange.new')}
        required
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <Input
        type="password"
        autoComplete="new-password"
        label={t('passwordChange.repeat')}
        required
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
      />

      <div className="flex">
        <Button disabled={changePassword.isPending} onClick={submit}>
          {changePassword.isPending ? t('profileEdit.saving') : t('passwordChange.save')}
        </Button>
      </div>
    </div>
  )
}
