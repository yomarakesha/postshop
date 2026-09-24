import { User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useLoginModel } from '../model/useLoginModel'
import { Button } from '@/shared/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { LanguageSwitcher } from '@/widgets/LanguageSwither'
import { ThemeSwither } from '@/widgets/ThemeSwither'

export function LoginPage() {
  const { t } = useTranslation()
  const { form, mutation } = useLoginModel()

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background px-4 py-8 sm:p-6">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwither />
      </div>
      {/* Subtle radial glow behind the card */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-80 w-80 rounded-full bg-primary/3 blur-[100px] sm:h-125 sm:w-125" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/logo.webp" alt="PostShop" className="h-8" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card/60 p-6 shadow-xs backdrop-blur-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold tracking-tight">{t('login.welcomeBack')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="username">{t('fields.username')}</Label>
                  <InputGroup className="h-10">
                    <InputGroupAddon>
                      <InputGroupText>
                        <User className="size-4 text-muted-foreground" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="username"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-10"
                      placeholder={t('placeholders.username')}
                      autoComplete="username"
                      required
                    />
                  </InputGroup>
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('fields.password')}</Label>
                  <PasswordInput
                    id="password"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('placeholders.password')}
                    autoComplete="current-password"
                    required
                  />
                </div>
              )}
            </form.Field>

            {mutation.isError && <p className="text-sm text-destructive">{t('login.error')}</p>}

            <Button
              type="submit"
              className="mt-5 h-10 w-full text-sm"
              isLoading={mutation.isPending}
            >
              {t('login.signIn')}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} PostShop. {t('login.allRightsReserved')}
        </p>
      </div>
    </div>
  )
}
