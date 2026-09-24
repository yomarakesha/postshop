import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, X } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { Modal } from '#/shared/ui/Modal'
import { useReadDeliveryMessageDeliveryMessageGet } from '#/shared/openapi/queries'

export const DeliveryInfoModal = () => {
  const { t, i18n } = useTranslation()
  const modalRef = useRef<ModalRef>(null)
  const { data: deliveryMessage } = useReadDeliveryMessageDeliveryMessageGet()

  const translation = deliveryMessage?.translations.find((tr) => tr.language === i18n.language)
  const hasContent = translation?.text && translation.text.replace(/<[^>]*>/g, '').trim().length > 0

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-center gap-2 p3 font-medium text-blue-main"
        onClick={() => modalRef.current?.open()}
      >
        <Info size={18} />
        {t('cart.aboutDelivery')}
      </button>

      <Modal ref={modalRef} className="w-150 max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="p1 font-bold">{t('cart.aboutDelivery')}</h2>
          <button
            type="button"
            onClick={() => modalRef.current?.close()}
            className="text-passive2 hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto no-scrollbar max-h-[calc(80vh-60px)]">
          {hasContent ? (
            <div
              className="prose prose-sm **:text-text!"
              dangerouslySetInnerHTML={{ __html: translation.text }}
            />
          ) : (
            <p className="text-passive2 text-center p3">{t('cart.noDeliveryInfo')}</p>
          )}
        </div>
      </Modal>
    </>
  )
}
