import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCountriesQuery } from '../model/useCountriesQuery'
import { useRegionQuery } from '../model/useRegionQuery'
import { useToggleRegionStatusMutation } from '../model/useToggleRegionStatusMutation'
import { useUpdateRegionMutation } from '../model/useUpdateRegionMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type {
  CountryResponse,
  RegionResponse,
  RegionUpdate,
  TranslationInput,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

export function EditRegionPage() {
  const { id } = useParams<{ id: string }>()
  const regionId = Number(id)
  const { t, i18n } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.REGIONS.block)

  const { data, isLoading } = useRegionQuery(regionId)
  const { countries } = useCountriesQuery()
  const mutation = useUpdateRegionMutation(regionId)
  const toggleStatus = useToggleRegionStatusMutation(regionId)

  const region = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!region) return null

  return (
    <EditRegionForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={region.id}
      region={region}
      countries={countries}
      uiLang={i18n.language}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(region.is_active)}
      t={t}
    />
  )
}

function EditRegionForm({
  isSubmitting,
  region,
  countries,
  uiLang,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  region: RegionResponse
  countries: CountryResponse[]
  uiLang: string
  canBlock: boolean
  onSubmit: (value: RegionUpdate) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      name_en: getTranslationName(region.translations, 'en'),
      name_ru: getTranslationName(region.translations, 'ru'),
      name_tk: getTranslationName(region.translations, 'tk'),
      name_tr: getTranslationName(region.translations, 'tr'),
      country_id: region.country_id,
    },
    onSubmit: ({ value }) => {
      const translations: TranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      onSubmit({
        translations,
        country_id: value.country_id,
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

        <form.Field name="country_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label>{t('regions.country')}</Label>
              <Select
                value={field.state.value.toString()}
                onValueChange={(val) => field.handleChange(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('regions.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {getTranslationName(country.translations, uiLang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={region.is_active ? 'success' : 'destructive'}>
                {region.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={region.is_active}
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
