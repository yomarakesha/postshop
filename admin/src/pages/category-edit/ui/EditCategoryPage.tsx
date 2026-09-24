import { useForm } from '@tanstack/react-form'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useCategoryQuery } from '../model/useCategoryQuery'
import { useParentCategoriesQuery } from '../model/useParentCategoriesQuery'
import { useToggleCategoryStatusMutation } from '../model/useToggleCategoryStatusMutation'
import { useUpdateCategoryMutation } from '../model/useUpdateCategoryMutation'
import { useUploadCategoryImageMutation } from '../model/useUploadCategoryImageMutation'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { buildFileUrl } from '@/shared/lib/buildFileUrl'
import { getTranslationName } from '@/shared/lib/getTranslationName'
import type { CategoryResponse, CategoryUpdate, TranslationInput } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Form } from '@/widgets/Form'

export function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const categoryId = Number(id)
  const { t, i18n } = useTranslation()
  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.CATEGORIES.block)

  const { data, isLoading } = useCategoryQuery(categoryId)
  const { parentCategories } = useParentCategoriesQuery()
  const mutation = useUpdateCategoryMutation(categoryId)
  const toggleStatus = useToggleCategoryStatusMutation(categoryId)
  const uploadImage = useUploadCategoryImageMutation(categoryId)

  const category = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!category) return null

  return (
    <EditCategoryForm
      isSubmitting={mutation.isPending || toggleStatus.isPending || uploadImage.isPending}
      key={category.id}
      category={category}
      parentCategories={parentCategories}
      uiLang={i18n.language}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(category.is_active)}
      onUploadImage={(file) => uploadImage.mutate(file)}
      isUploadingImage={uploadImage.isPending}
      t={t}
    />
  )
}

function EditCategoryForm({
  isSubmitting,
  category,
  parentCategories,
  uiLang,
  canBlock,
  onSubmit,
  onToggleStatus,
  onUploadImage,
  isUploadingImage,
  t,
}: {
  isSubmitting: boolean
  category: CategoryResponse
  parentCategories: CategoryResponse[]
  uiLang: string
  canBlock: boolean
  onSubmit: (value: CategoryUpdate) => void
  onToggleStatus: () => void
  onUploadImage: (file: File) => void
  isUploadingImage: boolean
  t: (key: string) => string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const imageUrl = category.image_path ? buildFileUrl(category.image_path) : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUploadImage(file)
    e.target.value = ''
  }
  const form = useForm({
    defaultValues: {
      name_en: getTranslationName(category.translations, 'en'),
      name_ru: getTranslationName(category.translations, 'ru'),
      name_tk: getTranslationName(category.translations, 'tk'),
      name_tr: getTranslationName(category.translations, 'tr'),
      parent_id: category.parent_id,
    },
    onSubmit: ({ value }) => {
      const translations: TranslationInput[] = [
        { language: 'ru', name: value.name_ru },
        { language: 'tk', name: value.name_tk },
        { language: 'en', name: value.name_en },
      ]
      if (value.name_tr) translations.push({ language: 'tr', name: value.name_tr })
      onSubmit({
        translations,
        parent_id: value.parent_id,
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
      <div className="flex items-center gap-5 rounded-xl border px-5 py-5">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
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
          <Label>{t('fields.image')}</Label>
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
                      {getTranslationName(cat.translations, uiLang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {canBlock && (
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label>{t('fields.status')}</Label>
              <Badge variant={category.is_active ? 'success' : 'destructive'}>
                {category.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={category.is_active}
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
