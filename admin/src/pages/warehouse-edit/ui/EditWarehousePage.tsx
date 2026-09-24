import { useForm } from '@tanstack/react-form'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useToggleWarehouseStatusMutation } from '../model/useToggleWarehouseStatusMutation'
import { useUpdateWarehouseMutation } from '../model/useUpdateWarehouseMutation'
import { useWarehouseQuery } from '../model/useWarehouseQuery'
import type { WarehouseResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Form } from '@/widgets/Form'

export function EditWarehousePage() {
  const { id } = useParams<{ id: string }>()
  const warehouseId = Number(id)
  const { t } = useTranslation()

  const { data, isLoading } = useWarehouseQuery(warehouseId)
  const mutation = useUpdateWarehouseMutation(warehouseId)
  const toggleStatus = useToggleWarehouseStatusMutation(warehouseId)

  const warehouse = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!warehouse) return null

  return (
    <EditWarehouseForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={warehouse.id}
      warehouse={warehouse}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(warehouse.is_active)}
      t={t}
    />
  )
}

function EditWarehouseForm({
  isSubmitting,
  warehouse,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  warehouse: WarehouseResponse
  onSubmit: (value: { name: string; address: string; phone_numbers: string[] }) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const form = useForm({
    defaultValues: {
      name: warehouse.name,
      address: warehouse.address,
      phones: warehouse.phone_numbers.length > 0 ? warehouse.phone_numbers : [''],
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name,
        address: value.address,
        phone_numbers: value.phones.filter((p) => p.trim()),
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

        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="space-y-0.5">
            <Label>{t('fields.status')}</Label>
            <Badge variant={warehouse.is_active ? 'success' : 'destructive'}>
              {warehouse.is_active ? t('active') : t('blocked')}
            </Badge>
          </div>
          <ConfirmSwitch
            checked={warehouse.is_active}
            onConfirmedChange={onToggleStatus}
            title={t('confirm.blockTitle')}
            description={t('confirm.blockText')}
            confirmLabel={t('confirm.blockConfirm')}
          />
        </div>
      </div>
    </Form>
  )
}
