import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { useCreateUserMutation } from '../model/useCreateUserMutation'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Form } from '@/widgets/Form'

export function CreateUserPage() {
  const { t } = useTranslation()
  const mutation = useCreateUserMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        name: value.name || null,
        surname: value.surname || null,
        username: value.username,
        phone: value.phone || null,
        password: value.password,
      })
    },
  })

  return (
    <Form
      isSubmitting={mutation.isPending}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('fields.firstName')}</Label>
              <Input
                id="name"
                placeholder={t('users.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="surname">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="surname">{t('fields.surname')}</Label>
              <Input
                id="surname"
                placeholder={t('users.surnamePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="username">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('fields.username')}</Label>
              <Input
                id="username"
                placeholder={t('users.usernamePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('fields.phone')}</Label>
              <Input
                id="phone"
                placeholder={t('users.phonePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('fields.password')}</Label>
              <PasswordInput
                id="password"
                placeholder={t('users.passwordPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              if (value && value !== fieldApi.form.getFieldValue('password')) {
                return t('users.passwordMismatch')
              }
            },
            onSubmit: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue('password')) {
                return t('users.passwordMismatch')
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('fields.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder={t('users.confirmPasswordPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
