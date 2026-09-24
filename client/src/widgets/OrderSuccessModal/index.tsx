import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { Button } from '#/shared/ui/Button'
import { SuccessScreen } from '#/shared/ui/SuccessScreen'

interface Props {
  onGoHome: () => void
  onShowOrder: () => void
}

export const OrderSuccessModal = forwardRef<ModalRef, Props>(({ onGoHome, onShowOrder }, ref) => {
  const { t } = useTranslation()

  return (
    <Modal ref={ref} className="w-137.5 bg-gray2">
      <SuccessScreen
        title={t('checkout.success.title')}
        description={t('checkout.success.description')}
      >
        <Button variant="secondary" className="w-full" onClick={onGoHome}>
          {t('checkout.success.goHome')}
        </Button>
        <Button className="w-full" onClick={onShowOrder}>
          {t('checkout.success.showOrder')}
        </Button>
      </SuccessScreen>
    </Modal>
  )
})

OrderSuccessModal.displayName = 'OrderSuccessModal'
