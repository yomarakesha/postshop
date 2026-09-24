import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MapPin } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import type { ConfirmDialogRef } from '#/shared/ui/ConfirmDialog'
import {
  useCreateAddressUserAddressesPost,
  useDeleteAddressUserAddressesAddressIdDelete,
  useListAddressesUserAddressesGet,
  useSetDefaultAddressUserAddressesAddressIdDefaultPatch,
  useUpdateAddressUserAddressesAddressIdPut,
} from '#/shared/openapi/queries'
import { useListAddressesUserAddressesGetKey } from '#/shared/openapi/queries/common'
import { Button } from '#/shared/ui/Button'
import { Input } from '#/shared/ui/Input'
import { Modal } from '#/shared/ui/Modal'
import { ListSkeleton } from '#/shared/ui/ListSkeleton'
import { EmptyState } from '#/shared/ui/EmptyState'
import { RadioCircle } from '#/shared/ui/RadioCircle'
import { ConfirmDialog } from '#/shared/ui/ConfirmDialog'
import { settled } from '#/shared/lib/settled'

/**
 * Свои адреса доставки.
 *
 * Адрес набирался заново при каждом оформлении: сохранить его было нельзя, и
 * человек, заказывающий домой третий раз, третий раз печатал одно и то же.
 *
 * Основной адрес ровно один — он подставляется при оформлении. Признак держит
 * сервер, поэтому здесь достаточно попросить его сменить.
 */
export const ProfileAddressesPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const formModalRef = useRef<ModalRef>(null)
  const deleteDialogRef = useRef<ConfirmDialogRef>(null)

  const { data: addresses, isLoading } = useListAddressesUserAddressesGet()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [useListAddressesUserAddressesGetKey] })

  const createAddress = useCreateAddressUserAddressesPost()
  const updateAddress = useUpdateAddressUserAddressesAddressIdPut()
  const setDefault = useSetDefaultAddressUserAddressesAddressIdDefaultPatch(undefined, {
    onSuccess: () => void refresh(),
  })
  const deleteAddress = useDeleteAddressUserAddressesAddressIdDelete(undefined, {
    onSuccess: () => {
      toast.success(t('addresses.deleted'))
      void refresh()
    },
  })

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setAddress('')
    formModalRef.current?.open()
  }

  const openEdit = (row: { id: number; title: string; address: string }) => {
    setEditingId(row.id)
    setTitle(row.title)
    setAddress(row.address)
    formModalRef.current?.open()
  }

  const submit = async () => {
    if (!title.trim()) {
      toast.error(t('addresses.titleRequired'))
      return
    }
    if (!address.trim()) {
      toast.error(t('addresses.addressRequired'))
      return
    }

    const result =
      editingId === null
        ? await settled(
            createAddress.mutateAsync({ body: { title: title.trim(), address: address.trim() } }),
          )
        : await settled(
            updateAddress.mutateAsync({
              path: { address_id: editingId },
              body: { title: title.trim(), address: address.trim() },
            }),
          )

    if (result?.data) {
      toast.success(t(editingId === null ? 'addresses.created' : 'addresses.saved'))
      formModalRef.current?.close()
      void refresh()
    }
  }

  const isPending = createAddress.isPending || updateAddress.isPending

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-base bg-white p-4 shadow-base">
        <div>
          <h1 className="p1 font-bold">{t('addresses.title')}</h1>
          <p className="t1 mt-1 text-passive2">{t('addresses.subtitle')}</p>
        </div>
        <Button size="md" onClick={openCreate}>
          {t('addresses.add')}
        </Button>
      </div>

      {isLoading && <ListSkeleton rows={3} />}

      {!isLoading && (addresses ?? []).length === 0 && (
        <EmptyState icon={<MapPin size={40} strokeWidth={1.5} />} title={t('addresses.empty')} />
      )}

      <ul className="flex flex-col gap-2">
        {(addresses ?? []).map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-base bg-white p-4 shadow-base"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray2">
              <MapPin width={18} height={18} className="text-passive2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="p3 font-medium">
                {row.title}
                {row.is_default && (
                  <span className="t2 ml-2 rounded-full bg-blue2 px-2 py-0.5 font-medium text-blue-main">
                    {t('addresses.defaultBadge')}
                  </span>
                )}
              </p>
              <p className="t1 text-passive2">{row.address}</p>
            </div>
            {/* Основной выбирается тут же: отдельный экран для одного признака
                был бы лишним шагом. */}
            <button
              type="button"
              className="flex items-center gap-2"
              disabled={row.is_default || setDefault.isPending}
              onClick={() => setDefault.mutate({ path: { address_id: row.id } })}
            >
              <RadioCircle selected={row.is_default} />
              <span className="t2 text-passive2">{t('addresses.makeDefault')}</span>
            </button>
            <Button variant="tertiary" size="sm" onClick={() => openEdit(row)}>
              {t('addresses.edit')}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              className="text-failure"
              onClick={() => {
                setDeletingId(row.id)
                deleteDialogRef.current?.open()
              }}
            >
              {t('addresses.delete')}
            </Button>
          </li>
        ))}
      </ul>

      <Modal ref={formModalRef} className="w-full max-w-110 p-6">
        <div className="flex flex-col gap-4">
          <h2 className="p2 font-bold">
            {t(editingId === null ? 'addresses.add' : 'addresses.editTitle')}
          </h2>
          <Input
            label={t('addresses.name')}
            required
            placeholder={t('addresses.namePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label={t('addresses.address')}
            required
            placeholder={t('addresses.addressPlaceholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex gap-3">
            <Button disabled={isPending} onClick={submit}>
              {isPending ? t('profileEdit.saving') : t('addresses.save')}
            </Button>
            <Button variant="tertiary" onClick={() => formModalRef.current?.close()}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        ref={deleteDialogRef}
        title={t('addresses.deleteTitle')}
        text={t('addresses.deleteText')}
        confirmLabel={t('addresses.delete')}
        destructive
        busy={deleteAddress.isPending}
        onConfirm={() => {
          if (deletingId !== null) deleteAddress.mutate({ path: { address_id: deletingId } })
        }}
      />
    </div>
  )
}
