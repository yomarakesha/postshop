import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { useCreateCityMutation } from '../model/useCreateCityMutation'
import { useRegionsQuery } from '../model/useRegionsQuery'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { TranslationInput } from '@/shared/openapi/requests'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

export function CreateCityPage() {
  const { t, i18n } = useTranslation()

  const { regions } = useRegionsQuery()
  const mutation = useCreateCityMutation()

  const form = useForm({
    defaultValues: {
      name_en: '',
      name_ru: '',
      name_tk: '',
      name_tr: '',
      region_id: 0,
    },
    onSubmit: ({ value }) => {
      const translations: TranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      mutation.mutate({
        translations,
        region_id: value.region_id,
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

        <form.Field name="region_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label>{t('cities.region')}</Label>
              <Select
                value={field.state.value ? field.state.value.toString() : ''}
                onValueChange={(val) => field.handleChange(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('cities.selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {getTranslationName(region.translations, i18n.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
