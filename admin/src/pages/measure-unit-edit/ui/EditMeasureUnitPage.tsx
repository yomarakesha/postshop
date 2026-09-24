import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useMeasureUnitQuery } from '../model/useMeasureUnitQuery'
import { useToggleMeasureUnitStatusMutation } from '../model/useToggleMeasureUnitStatusMutation'
import { useUpdateMeasureUnitMutation } from '../model/useUpdateMeasureUnitMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type {
  MeasureUnitResponse,
  MeasureUnitUpdate,
  TranslationInput,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditMeasureUnitPage() {
  const { id } = useParams<{ id: string }>()
  const unitId = Number(id)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.MEASURE_UNITS.block)

  const { data, isLoading } = useMeasureUnitQuery(unitId)
  const mutation = useUpdateMeasureUnitMutation(unitId)
  const toggleStatus = useToggleMeasureUnitStatusMutation(unitId)

  const unit = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!unit) return null

  return (
    <EditMeasureUnitForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={unit.id}
      unit={unit}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(unit.is_active)}
      t={t}
    />
  )
}

function EditMeasureUnitForm({
  isSubmitting,
  unit,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  unit: MeasureUnitResponse
  canBlock: boolean
  onSubmit: (value: MeasureUnitUpdate) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      code: unit.code,
      name_en: getTranslationName(unit.translations, 'en'),
      name_ru: getTranslationName(unit.translations, 'ru'),
      name_tk: getTranslationName(unit.translations, 'tk'),
      name_tr: getTranslationName(unit.translations, 'tr'),
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
              <Label htmlFor="code">{t('measureUnits.code')}</Label>
              <Input
                id="code"
                placeholder={t('measureUnits.codePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
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
              <Badge variant={unit.is_active ? 'success' : 'destructive'}>
                {unit.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={unit.is_active}
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
