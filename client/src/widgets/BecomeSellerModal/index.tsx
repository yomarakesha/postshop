import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { LoginRequired } from '../LoginRequired'
import { Adds } from './ui/Adds'
import { TradeType } from './ui/TradeType'
import { DocumentUpload } from './ui/DocumentUpload'
import { Success } from './ui/Success'
import type { Easing } from 'motion/react'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { useBecomeStoreForm } from '#/pages/home/model/useBecomeStoreForm'
import { useProfileStore } from '#/shared/stores/profileStore'

export type BecomeSellerModalRef = {
  open: () => void
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

const transition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as Easing,
}

export const BecomeSellerModal = forwardRef<BecomeSellerModalRef>((_, ref) => {
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const hasShop = (profile?.shops?.length ?? 0) > 0
  const modalRef = useRef<ModalRef>(null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const { form, isSubmitting, error, reset } = useBecomeStoreForm({
    onSuccess: () => goTo(3),
  })

  const handleOpen = () => {
    setStep(hasShop ? 1 : 0)
    reset()
    modalRef.current?.open()
  }

  useImperativeHandle(ref, () => ({ open: handleOpen }))

  const handleClose = () => {
    modalRef.current?.close()
  }
  return (
    <Modal ref={modalRef} className="w-137.5 bg-gray2">
      {profile ? (
        <div className="overflow-hidden relative">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 0 && <Adds onClose={handleClose} onNext={() => goTo(1)} />}
              {step === 1 && (
                <TradeType
                  form={form}
                  onBack={hasShop ? handleClose : () => goTo(0)}
                  onNext={() => goTo(2)}
                />
              )}
              {step === 2 && (
                <DocumentUpload
                  form={form}
                  isSubmitting={isSubmitting}
                  error={error}
                  onBack={() => goTo(1)}
                />
              )}
              {step === 3 && <Success onClose={handleClose} />}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <LoginRequired
          onClose={handleClose}
          description={t('services.loginRequired.description')}
        />
      )}
    </Modal>
  )
})
