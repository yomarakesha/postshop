import { useForm } from '@tanstack/react-form'
import { ImageIcon, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateCategoryMutation } from '../model/useCreateCategoryMutation'
import { useParentCategoriesQuery } from '../model/useParentCategoriesQuery'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { TranslationInput } from '@/shared/openapi/requests'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

export function CreateCategoryPage() {
  const { t, i18n } = useTranslation()

  const { parentCategories } = useParentCategoriesQuery()
  const mutation = useCreateCategoryMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const form = useForm({
    defaultValues: {
      name_en: '',
      name_ru: '',
      name_tk: '',
      name_tr: '',
      parent_id: null as number | null,
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
        parent_id: value.parent_id,
        image,
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
      <div className="flex items-center gap-5 rounded-xl border px-5 py-5">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {imagePreview ? (
            <img src={imagePreview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>{t('fields.image')}</Label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              {t('categories.uploadImage')}
            </Button>
          </div>
        </div>
      </div>

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

        <form.Field name="parent_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label>{t('categories.parent')}</Label>
              <Select
                value={field.state.value?.toString() ?? 'none'}
                onValueChange={(val) => field.handleChange(val === 'none' ? null : Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('categories.selectParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('categories.noParent')}</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {getTranslationName(cat.translations, i18n.language)}
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
