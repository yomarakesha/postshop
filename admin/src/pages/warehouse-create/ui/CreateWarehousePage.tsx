import { useForm } from '@tanstack/react-form'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCreateWarehouseMutation } from '../model/useCreateWarehouseMutation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function CreateWarehousePage() {
  const { t } = useTranslation()
  const mutation = useCreateWarehouseMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      phones: [''],
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        name: value.name,
        address: value.address,
        phone_numbers: value.phones.filter((p) => p.trim()),
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
              <Label htmlFor="name">{t('warehouses.name')}</Label>
              <Input
                id="name"
                placeholder={t('warehouses.namePlaceholder')}
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
              <Label htmlFor="address">{t('warehouses.address')}</Label>
              <Input
                id="address"
                placeholder={t('warehouses.addressPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="phones">
          {(field) => (
            <div className="col-span-2 space-y-1.5">
              <Label>{t('warehouses.phones')}</Label>
              <div className="space-y-2">
                {field.state.value.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t('warehouses.phonesPlaceholder')}
                      value={phone}
                      onChange={(e) => {
                        const next = [...field.state.value]
                        next[index] = e.target.value
                        field.handleChange(next)
                      }}
                      required
                    />
                    {field.state.value.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        onClick={() => {
                          field.handleChange(field.state.value.filter((_, i) => i !== index))
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => field.handleChange([...field.state.value, ''])}
                >
                  <Plus className="size-4" />
                  {t('warehouses.addPhone')}
                </Button>
              </div>
            </div>
          )}
        </form.Field>
      </div>
    </Form>
  )
}
