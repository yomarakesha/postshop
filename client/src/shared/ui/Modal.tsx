import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../utils/cn'

export interface ModalRef {
  open: () => void
  close: () => void
}

interface ModalProps {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export const Modal = forwardRef<ModalRef, ModalProps>(({ children, onClose, className }, ref) => {
  const [visible, setVisible] = useState(false)

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: handleClose,
  }))

  // Пока окно открыто, страница под ним не прокручивается. Без этого колесо
  // мыши уводило фон, а окно оставалось на месте: выглядело так, будто оно
  // отвалилось от страницы. Прежнюю ширину полосы прокрутки компенсируем
  // отступом, иначе содержимое дёргается вбок в момент открытия.
  useEffect(() => {
    if (!visible) return
    const { body, documentElement: root } = document
    // Замок ставим и на html: страницу прокручивает корневой элемент, и
    // overflow только на body ничего не давал — фон продолжал уезжать.
    //
    // Ширину полосы прокрутки не компенсируем отступом: жёлоб под неё
    // зарезервирован постоянно (scrollbar-gutter в styles.css), поэтому
    // скрытие прокрутки ширину содержимого не меняет. Отступ на body был бы
    // вторым исправлением той же проблемы и сам дёргал бы вёрстку.
    const previous = { bodyOverflow: body.style.overflow, rootOverflow: root.style.overflow }
    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previous.bodyOverflow
      root.style.overflow = previous.rootOverflow
    }
  }, [visible])

  // Escape закрывает окно. Ожидаемо для любого модального окна, но здесь не
  // работало: закрыть можно было только щелчком по затемнению или кнопкой.
  useEffect(() => {
    if (!visible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          /* inset-0 вместо w-screen/h-screen: 100vw включает ширину полосы
             прокрутки, поэтому на странице с полосой затемнение оказывалось
             шире окна и раздвигало вёрстку. */
          className="fixed inset-0 bg-[#10182880] backdrop-blur-xs flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn('bg-white rounded-xl mx-4', className)}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

Modal.displayName = 'Modal'
