import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { useCitiesQuery } from '../model/useCitiesQuery'
import { useCreatePickupPointMutation } from '../model/useCreatePickupPointMutation'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { CoordinateFields, validateCoordinate } from '@/widgets/CoordinateFields'
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
        latitude: value.latitude.trim(),
        longitude: value.longitude.trim(),
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

        {/* Координаты задавались только щелчком по карте. Без
          VITE_MAP_TILES_URL карта не рисуется, а полей для ручного ввода не
          было — ни одного пункта выдачи создать было нельзя. Поля видны
          всегда; карта, если она есть, заполняет их же. */}
        <form.Field
          name="latitude"
          validators={{
            onSubmit: ({ value }) => validateCoordinate(value, 'latitude', t),
          }}
        >
          {(latField) => (
            <form.Field
              name="longitude"
              validators={{
                onSubmit: ({ value }) => validateCoordinate(value, 'longitude', t),
              }}
            >
              {(lngField) => (
                <div className="col-span-2 space-y-4">
                  <CoordinateFields
                    t={t}
                    latitude={{
                      value: latField.state.value,
                      errors: latField.state.meta.errors,
                      onChange: latField.handleChange,
                      onBlur: latField.handleBlur,
                    }}
                    longitude={{
                      value: lngField.state.value,
                      errors: lngField.state.meta.errors,
                      onChange: lngField.handleChange,
                      onBlur: lngField.handleBlur,
                    }}
                  />
                  <div className="space-y-1.5">
                    <Label>{t('pickupPoints.location')}</Label>
                    <LocationMap
                      latitude={latField.state.value}
                      longitude={lngField.state.value}
                      onChange={(lat, lng) => {
                        latField.handleChange(lat)
                        lngField.handleChange(lng)
                      }}
                    />
                  </div>
                </div>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
