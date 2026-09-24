import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
// import { PasswordChangeCard } from './ui/PasswordChangeCard'
import { PhoneChangeCard } from './ui/PhoneChangeCard'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { useProfileStore } from '#/shared/stores/profileStore'
import { useUpdateUserUsersUserIdPut } from '#/shared/openapi/queries'
import { settled } from '#/shared/lib/settled'

export const ProfileEditPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const setProfile = useProfileStore((s) => s.setProfile)
  const updateUser = useUpdateUserUsersUserIdPut()

  const form = useForm({
    defaultValues: {
      name: profile?.name ?? '',
      surname: profile?.surname ?? '',
    },
    onSubmit: async ({ value }) => {
      if (!profile) return

      const result = await settled(
        updateUser.mutateAsync({
          path: { user_id: profile.id },
          body: {
            name: value.name,
            surname: value.surname,
          },
        }),
      )

      // Сохранение проходило молча: страница просто менялась, и было непонятно,
      // применились ли данные (C-15).
      if (result?.data) {
        setProfile({ ...profile, name: value.name, surname: value.surname })
        toast.success(t('profileEdit.saved'))
        navigate({ to: '/profile' })
      } else {
        toast.error(t('login.errors.general'))
      }
    },
  })

  const handleCancel = () => {
    navigate({ to: '..' })
  }

  // Есть ли пароль, по выдаче профиля не видно: сервер его не отдаёт и отдавать
  // не должен. Отличаем по логину — пароль без логина войти не даёт, поэтому
  // учётная запись с логином считается имеющей пароль, а зарегистрировавшийся
  // по SMS задаёт пароль впервые.
  // Нужна только скрытой карточке «Задать пароль» — см. ниже.
  // const hasPassword = Boolean(profile?.username)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 bg-white rounded-xl shadow-base p-6">
        <h1 className="p1 font-bold text-center">{t('profileEdit.title')}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value.trim() ? t('profileEdit.nameRequired') : undefined),
            }}
          >
            {(field) => (
              <div>
                <Input
                  label={t('profileEdit.name')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="t2 text-failure mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="surname"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? t('profileEdit.surnameRequired') : undefined,
            }}
          >
            {(field) => (
              <div>
                <Input
                  label={t('profileEdit.surname')}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="t2 text-failure mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
          <div className="flex gap-3 justify-center">
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? t('profileEdit.saving') : t('profileEdit.save')}
                </Button>
              )}
            </form.Subscribe>
            <Button variant="tertiary" type="button" onClick={handleCancel}>
              {t('profileEdit.cancel')}
            </Button>
          </div>
        </form>
      </div>

      {profile && (
        <>
          <PhoneChangeCard
            phone={profile.phone}
            onChanged={(phone) => setProfile({ ...profile, phone })}
          />
          {/* Задать пароль — скрыто. Вход в витрину только по коду из SMS:
              в форме входа (widgets/Header/ui/LoginModal) поля пароля нет
              вовсе, и метод /auth/login оттуда не вызывается. Пароль можно
              было задать и никогда им не воспользоваться — карточка обещала
              то, чего в интерфейсе не существует. Сам метод смены пароля в
              API остаётся: им пользуется админка.
              Вернуть, если появится вход по логину и паролю. */}
          {/* <PasswordChangeCard hasPassword={hasPassword} /> */}
        </>
      )}
    </div>
  )
}
