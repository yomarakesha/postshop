import { useForm } from '@tanstack/react-form'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useBrandQuery } from '../model/useBrandQuery'
import { useToggleBrandStatusMutation } from '../model/useToggleBrandStatusMutation'
import { useUpdateBrandMutation } from '../model/useUpdateBrandMutation'
import { useUploadBrandImageMutation } from '../model/useUploadBrandImageMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import type { BrandResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditBrandPage() {
  const { id } = useParams<{ id: string }>()
  const brandId = Number(id)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.BRANDS.block)

  const { data, isLoading } = useBrandQuery(brandId)
  const mutation = useUpdateBrandMutation(brandId)
  const toggleStatus = useToggleBrandStatusMutation(brandId)
  const uploadImage = useUploadBrandImageMutation(brandId)

  const brand = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!brand) return null

  return (
    <EditBrandForm
      isSubmitting={mutation.isPending || toggleStatus.isPending || uploadImage.isPending}
      key={brand.id}
      brand={brand}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(brand.is_active)}
      onUploadImage={(file) => uploadImage.mutate(file)}
      isUploadingImage={uploadImage.isPending}
      t={t}
    />
  )
}

function EditBrandForm({
  isSubmitting,
  brand,
  canBlock,
  onSubmit,
  onToggleStatus,
  onUploadImage,
  isUploadingImage,
  t,
}: {
  isSubmitting: boolean
  brand: BrandResponse
  canBlock: boolean
  onSubmit: (value: { name: string }) => void
  onToggleStatus: () => void
  onUploadImage: (file: File) => void
  isUploadingImage: boolean
  t: (key: string) => string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageUrl = brand.image_path ? buildFileUrl(brand.image_path) : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUploadImage(file)
    e.target.value = ''
  }

  const form = useForm({
    defaultValues: {
      name: brand.name,
    },
    onSubmit: ({ value }) => {
      onSubmit({ name: value.name })
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
      <div className="flex items-center gap-5 rounded-xl border px-5 py-5">
        <div
          className="flex size-32 items-center justify-center overflow-hidden rounded-lg border bg-muted"
          style={{ aspectRatio: '1' }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
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
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
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

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={brand.is_active ? 'success' : 'destructive'}>
                {brand.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={brand.is_active}
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
