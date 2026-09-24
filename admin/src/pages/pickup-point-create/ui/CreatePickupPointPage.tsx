import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { useCitiesQuery } from '../model/useCitiesQuery'
import { useCreatePickupPointMutation } from '../model/useCreatePickupPointMutation'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'
import { LocationMap } from '@/widgets/LocationMap'

export function CreatePickupPointPage() {
  const { t, i18n } = useTranslation()
  const mutation = useCreatePickupPointMutation()
  const { cities } = useCitiesQuery()

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      city_id: '',
      latitude: '',
      longitude: '',
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        name: value.name,
        address: value.address,
        city_id: Number(value.city_id),
        latitude: value.latitude,
        longitude: value.longitude,
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
              <Label htmlFor="name">{t('pickupPoints.name')}</Label>
              <Input
                id="name"
                placeholder={t('pickupPoints.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="address">{t('pickupPoints.address')}</Label>
              <Input
                id="address"
                placeholder={t('pickupPoints.addressPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="city_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label>{t('pickupPoints.city')}</Label>
              <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pickupPoints.selectCity')} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {getTranslationName(city.translations, i18n.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <div />

        <form.Field
          name="latitude"
          validators={{
            onSubmit: ({ value }) => (!value ? t('pickupPoints.locationRequired') : undefined),
          }}
        >
          {(latField) => (
            <form.Field name="longitude">
              {(lngField) => (
                <div className="col-span-2 space-y-1.5">
                  <Label>{t('pickupPoints.location')}</Label>
                  <LocationMap
                    latitude={latField.state.value}
                    longitude={lngField.state.value}
                    onChange={(lat, lng) => {
                      latField.handleChange(lat)
                      lngField.handleChange(lng)
                    }}
                  />
                  {latField.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-sm">{latField.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
