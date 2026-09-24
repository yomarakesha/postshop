import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { formatPhone, phoneHref } from '#/shared/utils/phone'
import { Modal } from '#/shared/ui/Modal'
import CloseIcon from '#/shared/assets/icons/close.svg?react'
import PhoneIcon from '#/shared/assets/icons/phone.svg?react'
import StoreIcon from '#/shared/assets/icons/store.svg?react'

interface StoreInfoModalProps {
  name?: string
  logo?: string
  description?: string
  phones?: Array<string>
  addresses?: Array<string>
}

export const StoreInfoModal = forwardRef<ModalRef, StoreInfoModalProps>(
  ({ name, logo, description, phones = [], addresses = [] }, ref) => {
    const { t } = useTranslation()

    return (
      <Modal ref={ref} className="w-full max-w-110">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex-1" />
          <h2 className="p1 font-bold">{t('store.about')}</h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => (ref as React.RefObject<ModalRef>).current.close()}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {name && (
          <div className="flex items-center gap-3 px-6 pb-4">
            {logo && (
              <img
                src={logo}
                alt={name}
                className="w-12 h-12 rounded-base object-contain border border-stroke"
              />
            )}
            <h3 className="p2 font-semibold">{name}</h3>
          </div>
        )}

        <div className="flex flex-col gap-2 px-6 pb-6">
          {phones.length > 0 && (
            <div className="bg-gray2 rounded-base p-4">
              <div className="flex items-center gap-1.5 text-passive2 mb-3">
                <PhoneIcon className="w-4 h-4" />
                <span className="t1 font-medium">{t('store.phone')}</span>
              </div>
              <div className="flex flex-col gap-2">
                {phones.map((phone, i) => (
                  <a
                    key={i}
                    href={phoneHref(phone)}
                    className="p3 font-medium hover:text-blue-main transition-colors"
                  >
                    {formatPhone(phone)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="bg-gray2 rounded-base p-4">
              <div className="flex items-center gap-1.5 text-passive2 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="t1 font-medium">{t('store.address')}</span>
              </div>
              <div className="flex flex-col gap-2">
                {addresses.map((address, i) => (
                  <p key={i} className="p3">
                    {address}
                  </p>
                ))}
              </div>
            </div>
          )}

          {description && (
            <div className="bg-gray2 rounded-base p-4">
              <div className="flex items-center gap-1.5 text-passive2 mb-3">
                <StoreIcon className="w-4 h-4" />
                <span className="t1 font-medium">{t('store.description')}</span>
              </div>
              <p className="p3 leading-relaxed">{description}</p>
            </div>
          )}
        </div>
      </Modal>
    )
  },
)

StoreInfoModal.displayName = 'StoreInfoModal'
