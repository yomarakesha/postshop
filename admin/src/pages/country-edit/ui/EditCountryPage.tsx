import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCountryQuery } from '../model/useCountryQuery'
import { useToggleCountryStatusMutation } from '../model/useToggleCountryStatusMutation'
import { useUpdateCountryMutation } from '../model/useUpdateCountryMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { CountryResponse, CountryUpdate, TranslationInput } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditCountryPage() {
  const { id } = useParams<{ id: string }>()
  const countryId = Number(id)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.COUNTRIES.block)

  const { data, isLoading } = useCountryQuery(countryId)
  const mutation = useUpdateCountryMutation(countryId)
  const toggleStatus = useToggleCountryStatusMutation(countryId)

  const country = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!country) return null

  return (
    <EditCountryForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={country.id}
      country={country}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(country.is_active)}
      t={t}
    />
  )
}

function EditCountryForm({
  isSubmitting,
  country,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  country: CountryResponse
  canBlock: boolean
  onSubmit: (value: CountryUpdate) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      iso_code: country.iso_code,
      name_en: getTranslationName(country.translations, 'en'),
      name_ru: getTranslationName(country.translations, 'ru'),
      name_tk: getTranslationName(country.translations, 'tk'),
      name_tr: getTranslationName(country.translations, 'tr'),
    },
    onSubmit: ({ value }) => {
      const translations: TranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      onSubmit({
        iso_code: value.iso_code,
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
        <form.Field name="iso_code">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="iso_code">{t('countries.isoCode')}</Label>
              <Input
                id="iso_code"
                placeholder={t('countries.isoCodePlaceholder')}
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
              <Badge variant={country.is_active ? 'success' : 'destructive'}>
                {country.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={country.is_active}
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
