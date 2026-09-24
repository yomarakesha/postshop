import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { usePermissionsQuery } from '../model/usePermissionsQuery'
import { useSavePermissionsMutation } from '../model/useSavePermissionsMutation'
import { useToggleUserStatusMutation } from '../model/useToggleUserStatusMutation'
import { useUpdateUserMutation } from '../model/useUpdateUserMutation'
import { useUserQuery } from '../model/useUserQuery'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import type { PermissionResponse, UserDetailResponse } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { ConfirmSwitch } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Form } from '@/widgets/Form'

export function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const { t } = useTranslation()

  const { hasPermission } = useHasPermission()
  const canBlock = hasPermission(PERMISSION_KEYS.USERS.block)

  const { data, isLoading } = useUserQuery(userId)
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissionsQuery()
  const mutation = useUpdateUserMutation(userId)
  const toggleStatus = useToggleUserStatusMutation(userId)

  const user = data?.data
  const allPermissions = permissionsData?.data ?? []

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <EditUserForm
      isSubmitting={mutation.isPending || toggleStatus.isPending}
      key={user.id}
      user={user}
      allPermissions={allPermissions}
      userId={userId}
      canBlock={canBlock}
      onSubmit={(value) => mutation.mutate(value)}
      onToggleStatus={() => toggleStatus.mutate(user.is_active)}
      t={t}
    />
  )
}

function EditUserForm({
  isSubmitting,
  user,
  allPermissions,
  userId,
  canBlock,
  onSubmit,
  onToggleStatus,
  t,
}: {
  isSubmitting: boolean
  user: UserDetailResponse
  allPermissions: PermissionResponse[]
  userId: number
  canBlock: boolean
  onSubmit: (value: {
    name?: string | null
    surname?: string | null
    username?: string | null
    phone?: string | null
    password?: string | null
  }) => void
  onToggleStatus: () => void
  t: (key: string) => string
}) {
  const userPermissionCodes = new Set(user.permissions?.map((p) => p.code) ?? [])
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(userPermissionCodes)
  const savePermissions = useSavePermissionsMutation(userId)

  const form = useForm({
    defaultValues: {
      name: user.name ?? '',
      surname: user.surname ?? '',
      username: user.username ?? '',
      phone: user.phone ?? '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name || null,
        surname: value.surname || null,
        username: value.username || null,
        phone: value.phone || null,
        password: value.password || null,
      })
    },
  })

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const permissionsChanged =
    selectedPermissions.size !== userPermissionCodes.size ||
    [...selectedPermissions].some((code) => !userPermissionCodes.has(code))

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
              <Label htmlFor="name">{t('fields.firstName')}</Label>
              <Input
                id="name"
                placeholder={t('users.namePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="surname">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="surname">{t('fields.surname')}</Label>
              <Input
                id="surname"
                placeholder={t('users.surnamePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="username">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('fields.username')}</Label>
              <Input
                id="username"
                placeholder={t('users.usernamePlaceholder')}
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
              <Badge variant={user.is_active ? 'success' : 'destructive'}>
                {user.is_active ? t('active') : t('blocked')}
              </Badge>
            </div>
            <ConfirmSwitch
              checked={user.is_active}
              onConfirmedChange={onToggleStatus}
              title={t('confirm.blockUserTitle')}
              description={t('confirm.blockUserText')}
              confirmLabel={t('confirm.blockConfirm')}
            />
          </div>
        )}

        <form.Field name="phone">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('fields.phone')}</Label>
              <Input
                id="phone"
                placeholder={t('users.phonePlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('fields.password')}</Label>
              <PasswordInput
                id="password"
                placeholder={t('users.passwordPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              if (value && value !== fieldApi.form.getFieldValue('password')) {
                return t('users.passwordMismatch')
              }
            },
            onSubmit: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue('password')) {
                return t('users.passwordMismatch')
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('fields.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder={t('users.confirmPasswordPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {allPermissions.length > 0 && (
        <div className="space-y-4 rounded-xl border px-5 py-5">
          <div className="flex items-center justify-between">
            <Label className="text-base">{t('users.permissions')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const allSelected = allPermissions.every((p) => selectedPermissions.has(p.code))
                  if (allSelected) {
                    setSelectedPermissions(new Set())
                  } else {
                    setSelectedPermissions(new Set(allPermissions.map((p) => p.code)))
                  }
                }}
              >
                {allPermissions.every((p) => selectedPermissions.has(p.code))
                  ? t('users.deselectAllPermissions')
                  : t('users.selectAllPermissions')}
              </Button>
              {permissionsChanged && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => savePermissions.mutate([...selectedPermissions])}
                  disabled={savePermissions.isPending}
                >
                  {savePermissions.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  {t('users.savePermissions')}
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allPermissions.map((permission) => (
              <label
                key={permission.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedPermissions.has(permission.code)}
                  onCheckedChange={() => togglePermission(permission.code)}
                />
                <div>
                  <div className="text-sm font-medium">{permission.code}</div>
                  {permission.description && (
                    <div className="text-xs text-muted-foreground">{permission.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </Form>
  )
}
