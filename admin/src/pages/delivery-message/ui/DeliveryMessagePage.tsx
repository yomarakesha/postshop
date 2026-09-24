import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCreateDeliveryMessageMutation } from '../model/useCreateDeliveryMessageMutation'
import { useDeliveryMessageQuery } from '../model/useDeliveryMessageQuery'
import { useUpdateDeliveryMessageMutation } from '../model/useUpdateDeliveryMessageMutation'
import type { DeliveryMessageTranslationInput } from '@/shared/openapi/requests'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { TiptapEditor } from '@/shared/ui/tiptap-editor'

function getTranslationText(
  translations: Array<{ language: string; text: string }> | undefined,
  language: string,
) {
  return translations?.find((t) => t.language === language)?.text ?? ''
}

export function DeliveryMessagePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useDeliveryMessageQuery()
  const createMutation = useCreateDeliveryMessageMutation()
  const updateMutation = useUpdateDeliveryMessageMutation()

  const message = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <DeliveryMessageForm
      key={message?.id ?? 'new'}
      initialTranslations={message?.translations}
      exists={!!message}
      onSave={(translations) => {
        if (message) {
          updateMutation.mutate({ translations })
        } else {
          createMutation.mutate({ translations })
        }
      }}
      isPending={createMutation.isPending || updateMutation.isPending}
      t={t}
    />
  )
}

function DeliveryMessageForm({
  initialTranslations,
  exists,
  onSave,
  isPending,
  t,
}: {
  initialTranslations?: Array<{ language: string; text: string }>
  exists: boolean
  onSave: (translations: DeliveryMessageTranslationInput[]) => void
  isPending: boolean
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      text_ru: getTranslationText(initialTranslations, 'ru'),
      text_tk: getTranslationText(initialTranslations, 'tk'),
      text_en: getTranslationText(initialTranslations, 'en'),
      text_tr: getTranslationText(initialTranslations, 'tr'),
    },
    onSubmit: ({ value }) => {
      const translations: DeliveryMessageTranslationInput[] = [
        { language: 'ru', text: value.text_ru },
        { language: 'tk', text: value.text_tk },
        { language: 'en', text: value.text_en },
      ]
      if (value.text_tr) translations.push({ language: 'tr', text: value.text_tr })
      onSave(translations)
    },
  })

  const languages = [
    { name: 'text_ru' as const, label: t('deliveryMessage.textRu') },
    { name: 'text_tk' as const, label: t('deliveryMessage.textTk') },
    { name: 'text_en' as const, label: t('deliveryMessage.textEn') },
    { name: 'text_tr' as const, label: t('deliveryMessage.textTr') },
  ]

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {exists ? t('save') : t('create')}
        </Button>
      </div>

      {languages.map((lang) => (
        <form.Field key={lang.name} name={lang.name}>
          {(field) => (
            <div className="space-y-3 rounded-xl border px-5 py-5">
              <Label>{lang.label}</Label>
              <TiptapEditor
                content={field.state.value}
                onChange={(html) => field.handleChange(html)}
              />
            </div>
          )}
        </form.Field>
      ))}
    </form>
  )
}
