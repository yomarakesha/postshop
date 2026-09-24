import { useForm } from '@tanstack/react-form'
import { ImageIcon, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCreateBrandMutation } from '../model/useCreateBrandMutation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function CreateBrandPage() {
  const { t } = useTranslation()
  const mutation = useCreateBrandMutation()

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
      name: '',
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ name: value.name, image })
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
        <div
          className="flex size-32 items-center justify-center overflow-hidden rounded-lg border bg-muted"
          style={{ aspectRatio: '1' }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>{t('brands.image')}</Label>
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
              {t('brands.uploadImage')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border px-5 py-5">
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('fields.name')}</Label>
              <Input
                id="name"
                placeholder={t('brands.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
