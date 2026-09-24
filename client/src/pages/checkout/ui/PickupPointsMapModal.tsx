import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Map as MapIcon, X } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import type { PickupPointResponse } from '#/shared/openapi/requests/types.gen'
import { Modal } from '#/shared/ui/Modal'
import { PickupPointsMap } from '#/widgets/PickupPointsMap'

interface PickupPointsMapModalProps {
  points: Array<PickupPointResponse>
  selectedId: number | null
  onSelect: (id: number) => void
}

export const PickupPointsMapModal = ({
  points,
  selectedId,
  onSelect,
}: PickupPointsMapModalProps) => {
  const { t } = useTranslation()
  const modalRef = useRef<ModalRef>(null)

  if (points.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => modalRef.current?.open()}
        className="flex items-center gap-1.5 t2 font-medium text-blue-main"
      >
        <MapIcon size={14} />
        {t('checkout.showOnMap')}
      </button>

      <Modal ref={modalRef} className="w-180 max-w-[92vw]">
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h2 className="p1 font-bold">{t('checkout.pickupPointsOnMap')}</h2>
          <button
            type="button"
            onClick={() => modalRef.current?.close()}
            className="text-passive2 hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <PickupPointsMap points={points} selectedId={selectedId} onSelect={onSelect} />
        </div>
      </Modal>
    </>
  )
}
