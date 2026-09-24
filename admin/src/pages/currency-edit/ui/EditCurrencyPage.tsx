import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCurrencyQuery } from '../model/useCurrencyQuery'
import { useToggleCurrencyStatusMutation } from '../model/useToggleCurrencyStatusMutation'
import { useUpdateCurrencyMutation } from '../model/useUpdateCurrencyMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { CurrencyResponse, CurrencyUpdate, TranslationInput } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditCurrencyPage() {
  const { id } = useParams<{ id: string }>()
  const currencyId = Number(id)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.CURRENCIES.block)

  const { data, isLoading } = useCurrencyQuery(currencyId)
  const mutation = useUpdateCurrencyMutation(currencyId)
  const toggleStatus = useToggleCurrencyStatusMutation(currencyId)

  const currency = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!currency) return null

  return (
    <EditCurrencyForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={currency.id}
      currency={currency}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(currency.is_active)}
      t={t}
    />
  )
}

function EditCurrencyForm({
  isSubmitting,
  currency,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  currency: CurrencyResponse
  canBlock: boolean
  onSubmit: (value: CurrencyUpdate) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      code: currency.code,
      name_en: getTranslationName(currency.translations, 'en'),
      name_ru: getTranslationName(currency.translations, 'ru'),
      name_tk: getTranslationName(currency.translations, 'tk'),
      name_tr: getTranslationName(currency.translations, 'tr'),
    },
    onSubmit: ({ value }) => {
      const translations: TranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      onSubmit({
        code: value.code,
        translations,
      })
    },
  })

  return (
    <Form
      isSubmitting={isSubmitting}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      submitLabel={t('save')}
    >
      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <form.Field name="code">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="code">{t('currencies.code')}</Label>
              <Input
                id="code"
                placeholder={t('currencies.codePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                onBlur={field.handleBlur}
                maxLength={3}
                required
              />
            </div>
          )}
        </form.Field>

        <div />

        <form.Field name="name_ru">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_ru">{t('fields.nameRu')}</Label>
              <Input
                id="name_ru"
                placeholder={t('placeholders.name')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_tk">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_tk">{t('fields.nameTk')}</Label>
              <Input
                id="name_tk"
                placeholder={t('placeholders.name')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_en">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_en">{t('fields.nameEn')}</Label>
              <Input
                id="name_en"
                placeholder={t('placeholders.name')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="name_tr">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name_tr">{t('fields.nameTr')}</Label>
              <Input
                id="name_tr"
                placeholder={t('placeholders.name')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={currency.is_active ? 'success' : 'destructive'}>
                {currency.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={currency.is_active}
              onConfirmedChange={onToggleStatus}
              title={t('confirm.blockTitle')}
              description={t('confirm.blockText')}
              confirmLabel={t('confirm.blockConfirm')}
            />
          </div>
        )}
      </div>
    </Form>
  )
}
