import { useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, Store, Store as StoreIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import type { ShopMeResponse } from '#/shared/openapi/requests'
import { Modal } from '#/shared/ui/Modal'
import { getImageUrl } from '#/shared/utils/getImageUrl'

interface StoreSelectModalProps {
  shops: Array<ShopMeResponse>
  className?: string
}

export const StoreSelectModal = ({ shops, className }: StoreSelectModalProps) => {
  const modalRef = useRef<ModalRef>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelect = (shopId: number) => {
    modalRef.current?.close()
    navigate({ to: '/my-store/$storeId', params: { storeId: String(shopId) } })
  }

  return (
    <>
      <button
        onClick={() => modalRef.current?.open()}
        title={t('header.myStore')}
        aria-label={t('header.myStore')}
        /* Тот же вид, что у остальных иконок шапки: этот вариант кнопки
           показывается владельцам нескольких магазинов, и без правки подпись
           осталась бы только у них. */
        className={
          className ??
          'flex size-11 items-center justify-center rounded-lg text-passive2 transition-colors hover:bg-gray2 hover:text-blue-main'
        }
      >
        <Store size={26} />
      </button>
      <Modal ref={modalRef} className="w-full max-w-125 p-6 bg-gray2">
        <h2 className="p1 text-center font-bold text-lg mb-6">{t('header.selectStore')}</h2>
        <div className="flex flex-col gap-3">
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleSelect(shop.id)}
              className="flex items-center gap-3 p-3 bg-white rounded-base cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {shop.logo_path ? (
                // Вписываем, а не обрезаем: у широкого логотипа квадрат с
                // object-cover оставлял середину надписи.
                <img
                  src={getImageUrl(shop.logo_path)}
                  alt={shop.name ?? ''}
                  className="h-10 w-auto max-w-24 shrink-0 rounded-sm object-contain"
                />
              ) : (
                <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <StoreIcon size={20} className="text-blue-main" />
                </div>
              )}
              <span className="p2 flex-1 text-left font-medium">
                {shop.name ?? `${t('header.myStore')} #${shop.id}`}
                {/* Отключённый магазин помечаем, а не прячем: спрятанный
                    выглядит как пропавший, и владелец решит, что потерял его.
                    Зайти в кабинет отключённого магазина можно и нужно —
                    именно оттуда его открывают обратно. */}
                {!shop.is_active && (
                  <span className="t2 ml-2 rounded-full bg-gray2 px-2 py-0.5 font-medium text-passive2">
                    {t('header.storeClosed')}
                  </span>
                )}
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
