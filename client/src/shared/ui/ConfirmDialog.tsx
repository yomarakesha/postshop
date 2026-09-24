import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Modal } from './Modal'
import type { ModalRef } from './Modal'

export interface ConfirmDialogRef {
  open: () => void
  close: () => void
}

interface Props {
  title: string
  text?: string
  confirmLabel: string
  cancelLabel?: string
  /** Красная кнопка подтверждения — для действий, которые что-то стирают. */
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
}

/**
 * Диалог подтверждения для необратимых и заметных действий.
 *
 * Очистка корзины делалась одним кликом по безымянной иконке, стоящей вплотную
 * к кнопке закрытия панели: случайное нажатие стирало корзину целиком, без
 * вопроса и без возможности вернуть. Диалог собран отдельным компонентом,
 * потому что таких мест несколько и в каждом писать своё окно значит рано или
 * поздно снова забыть спросить.
 */
export const ConfirmDialog = forwardRef<ConfirmDialogRef, Props>(
  ({ title, text, confirmLabel, cancelLabel, destructive, busy, onConfirm }, ref) => {
    const { t } = useTranslation()
    const modalRef = useRef<ModalRef>(null)

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }))

    return (
      <Modal ref={modalRef} className="w-full max-w-100 p-6">
        <div className="flex flex-col gap-4">
          <h2 className="p2 font-bold">{title}</h2>
          {text && <p className="p3 text-passive2">{text}</p>}
          <div className="flex gap-3">
            <Button
              variant={destructive ? 'danger' : 'primary'}
              disabled={busy}
              onClick={() => {
                onConfirm()
                modalRef.current?.close()
              }}
            >
              {confirmLabel}
            </Button>
            <Button variant="tertiary" disabled={busy} onClick={() => modalRef.current?.close()}>
              {cancelLabel ?? t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    )
  },
)

ConfirmDialog.displayName = 'ConfirmDialog'
