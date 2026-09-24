import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Switch } from '@/shared/ui/switch'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
}

/**
 * Диалог подтверждения для необратимых и заметных действий.
 *
 * В админке не было ни одного подтверждения: одним кликом и без вопросов
 * выполнялись блокировка магазина (витрина уходит офлайн), отклонение заявки
 * продавца, отклонение товара прямо из строки таблицы, отклонение заказа и
 * блокировка пользователя. Общий диалог в проекте лежал готовым
 * (shared/ui/dialog.tsx), но импортировался только из command.tsx, у которого
 * ноль импортёров — весь стек модалок был мёртв.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  busy,
  onConfirm,
}: ConfirmDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            {cancelLabel ?? t('confirm.cancel')}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={busy}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel ?? t('confirm.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmSwitchProps {
  checked: boolean
  onConfirmedChange: () => void
  /** Заголовок вопроса при выключении. Включение не спрашивает. */
  title: string
  description?: ReactNode
  confirmLabel?: string
  disabled?: boolean
}

/**
 * Переключатель «активен», который спрашивает перед выключением.
 *
 * Выключение убирает объект с витрины, включение — безобидно, поэтому вопрос
 * задаётся только в одну сторону: иначе подтверждения быстро становятся шумом,
 * который щёлкают не читая.
 */
export const ConfirmSwitch = ({
  checked,
  onConfirmedChange,
  title,
  description,
  confirmLabel,
  disabled,
}: ConfirmSwitchProps) => {
  const [askOpen, setAskOpen] = useState(false)

  return (
    <>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => {
          if (checked) {
            setAskOpen(true)
            return
          }
          onConfirmedChange()
        }}
      />
      <ConfirmDialog
        open={askOpen}
        onOpenChange={setAskOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive
        onConfirm={onConfirmedChange}
      />
    </>
  )
}
