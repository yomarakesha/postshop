import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCitiesQuery } from '../model/useCitiesQuery'
import { usePickupPointQuery } from '../model/usePickupPointQuery'
import { useTogglePickupPointStatusMutation } from '../model/useTogglePickupPointStatusMutation'
import { useUpdatePickupPointMutation } from '../model/useUpdatePickupPointMutation'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { PickupPointResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { CoordinateFields, validateCoordinate } from '@/widgets/CoordinateFields'
import { Form } from '@/widgets/Form'
import { LocationMap } from '@/widgets/LocationMap'

export function EditPickupPointPage() {
  const { id } = useParams<{ id: string }>()
  const pickupPointId = Number(id)
  const { t } = useTranslation()

  const { data, isLoading } = usePickupPointQuery(pickupPointId)
  const mutation = useUpdatePickupPointMutation(pickupPointId)
  const toggleStatus = useTogglePickupPointStatusMutation(pickupPointId)

  const pickupPoint = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pickupPoint) return null

  return (
    <EditPickupPointForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={pickupPoint.id}
      pickupPoint={pickupPoint}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(pickupPoint.is_active)}
      t={t}
    />
  )
}

function EditPickupPointForm({
  isSubmitting,
  pickupPoint,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  pickupPoint: PickupPointResponse
  onSubmit: (value: {
    name: string
    address: string
    city_id: number
    latitude: string
    longitude: string
  }) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const { cities } = useCitiesQuery()
  const { i18n } = useTranslation()

  const form = useForm({
    defaultValues: {
      name: pickupPoint.name,
      address: pickupPoint.address,
      city_id: String(pickupPoint.city_id),
      latitude: pickupPoint.latitude,
      longitude: pickupPoint.longitude,
    },
    onSubmit: ({ value }) => {
      onSubmit({
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
      isSubmitting={isSubmitting}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      submitLabel={t('save')}
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
                <SelectTrigger className="w-full">
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

        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="space-y-0.5">
            <Label>{t('fields.status')}</Label>
            <Badge variant={pickupPoint.is_active ? 'success' : 'destructive'}>
              {pickupPoint.is_active ? t('active') : t('blocked')}
            </Badge>
          </div>
          <ConfirmSwitch
            checked={pickupPoint.is_active}
            onConfirmedChange={onToggleStatus}
            title={t('confirm.blockTitle')}
            description={t('confirm.blockText')}
            confirmLabel={t('confirm.blockConfirm')}
          />
        </div>

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
