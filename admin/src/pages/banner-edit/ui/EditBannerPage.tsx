import { useForm } from '@tanstack/react-form'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useBannerQuery } from '../model/useBannerQuery'
import { useToggleBannerStatusMutation } from '../model/useToggleBannerStatusMutation'
import { useUpdateBannerMutation } from '../model/useUpdateBannerMutation'
import { useUploadBannerImageMutation } from '../model/useUploadBannerImageMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import type { BannerResponse } from '@/shared/openapi/requests'
import { BannerPosition } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

// Свободный ввод заменён списком: бэкенд принимает только эти три значения,
// раньше в поле попадал любой текст и молча сохранялся.
// Список дублировался в двух формах и разъезжался с перечислением из API,
// из-за чего позиция уходила на сервер как обычная строка.
const BANNER_POSITIONS = Object.values(BannerPosition)

export function EditBannerPage() {
  const { id } = useParams<{ id: string }>()
  const bannerId = Number(id)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.BANNERS.block)

  const { data, isLoading } = useBannerQuery(bannerId)
  const mutation = useUpdateBannerMutation(bannerId)
  const toggleStatus = useToggleBannerStatusMutation(bannerId)
  const uploadImage = useUploadBannerImageMutation(bannerId)

  const banner = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!banner) return null

  return (
    <EditBannerForm
      isSubmitting={mutation.isPending || toggleStatus.isPending || uploadImage.isPending}
      key={banner.id}
      banner={banner}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(banner.is_active)}
      onUploadImage={(file, language) => uploadImage.mutate({ file, language })}
      isUploadingImage={uploadImage.isPending}
      t={t}
    />
  )
}

function EditBannerForm({
  isSubmitting,
  banner,
  canBlock,
  onSubmit,
  onToggleStatus,
  onUploadImage,
  isUploadingImage,
  t,
}: {
  isSubmitting: boolean
  banner: BannerResponse
  canBlock: boolean
  onSubmit: (value: {
    name: string
    // Было string: позиция уходила на сервер как обычная строка, и любая
    // опечатка проходила проверку типов.
    position: BannerPosition
    link: string | null
    priority: number
    start_date: string | null
    end_date: string | null
  }) => void
  onToggleStatus: () => void
  onUploadImage: (file: File, language: string) => void
  isUploadingImage: boolean
  t: (key: string) => string
}) {
  const fileInputRefs = {
    tk: useRef<HTMLInputElement>(null),
    ru: useRef<HTMLInputElement>(null),
    en: useRef<HTMLInputElement>(null),
    tr: useRef<HTMLInputElement>(null),
  }

  const getImageUrl = (lang: string) => {
    const img = banner.images.find((i) => i.language === lang)
    return img?.image_path ? buildFileUrl(img.image_path) : null
  }

  const handleFileChange = (language: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUploadImage(file, language)
    e.target.value = ''
  }

  const form = useForm({
    defaultValues: {
      name: banner.name,
      position: banner.position,
      link: banner.link ?? '',
      priority: String(banner.priority),
      start_date: banner.start_date ?? '',
      end_date: banner.end_date ?? '',
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name,
        position: value.position as BannerPosition,
        link: value.link || null,
        priority: Number(value.priority),
        start_date: value.start_date || null,
        end_date: value.end_date || null,
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
        {(['tk', 'ru', 'en', 'tr'] as const).map((lang) => {
          const imageUrl = getImageUrl(lang)
          const ref = fileInputRefs[lang]
          return (
            <div key={lang} className="flex items-center gap-5">
              <div
                className="flex w-60 items-center justify-center overflow-hidden rounded-lg border bg-muted"
                style={{ aspectRatio: '2.5' }}
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
                <Label>{t(`banners.image${lang.charAt(0).toUpperCase() + lang.slice(1)}`)}</Label>
                <div>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange(lang)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => ref.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
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

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={banner.is_active ? 'success' : 'destructive'}>
                {banner.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={banner.is_active}
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
