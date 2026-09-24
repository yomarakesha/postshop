import { useForm } from '@tanstack/react-form'
import { ImageIcon, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateBannerMutation } from '../model/useCreateBannerMutation'
import { BannerPosition } from '@/shared/openapi/requests'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

const LANGUAGES = ['tk', 'ru', 'en', 'tr'] as const

// Свободный ввод заменён списком: бэкенд принимает только эти три значения,
// раньше в поле попадал любой текст и молча сохранялся.
// Список дублировался в двух формах и разъезжался с перечислением из API,
// из-за чего позиция уходила на сервер как обычная строка.
const BANNER_POSITIONS = Object.values(BannerPosition)

export function CreateBannerPage() {
  const { t } = useTranslation()
  const mutation = useCreateBannerMutation()

  const fileInputRefs = {
    tk: useRef<HTMLInputElement>(null),
    ru: useRef<HTMLInputElement>(null),
    en: useRef<HTMLInputElement>(null),
    tr: useRef<HTMLInputElement>(null),
  }
  const [images, setImages] = useState<Partial<Record<string, File>>>({})
  const [imagePreviews, setImagePreviews] = useState<Partial<Record<string, string>>>({})

  const handleFileChange = (language: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImages((prev) => ({ ...prev, [language]: file }))
      setImagePreviews((prev) => ({ ...prev, [language]: URL.createObjectURL(file) }))
    }
    e.target.value = ''
  }

  const form = useForm({
    defaultValues: {
      name: '',
      position: '' as BannerPosition | '',
      link: '',
      priority: '1',
      start_date: '',
      end_date: '',
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        name: value.name,
        position: value.position as BannerPosition,
        link: value.link || null,
        priority: Number(value.priority),
        start_date: value.start_date || null,
        end_date: value.end_date || null,
        images,
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
        {LANGUAGES.map((lang) => {
          const imagePreview = imagePreviews[lang]
          const ref = fileInputRefs[lang]
          return (
            <div key={lang} className="flex items-center gap-5">
              <div
                className="flex w-60 items-center justify-center overflow-hidden rounded-lg border bg-muted"
                style={{ aspectRatio: '2.5' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>{t(`banners.image${lang.charAt(0).toUpperCase() + lang.slice(1)}`)}</Label>
                <div>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange(lang)}
                  />
                  <Button type="button" variant="outline" onClick={() => ref.current?.click()}>
                    <Upload className="size-4" />
                    {t('banners.uploadImage')}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('fields.name')}</Label>
              <Input
                id="name"
                placeholder={t('banners.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="position">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="position">{t('banners.position')}</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as BannerPosition)}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder={t('banners.positionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>
                      {t(`banners.positions.${position}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="link">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="link">{t('banners.link')}</Label>
              <Input
                id="link"
                placeholder={t('banners.linkPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="priority">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="priority">{t('banners.priority')}</Label>
              <Input
                id="priority"
                type="number"
                min={1}
                max={5}
                placeholder="1"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="start_date">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="start_date">{t('banners.startDate')}</Label>
              <Input
                id="start_date"
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="end_date">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="end_date">{t('banners.endDate')}</Label>
              <Input
                id="end_date"
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
