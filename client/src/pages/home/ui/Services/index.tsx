import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import type { BecomeSellerModalRef } from '#/widgets/BecomeSellerModal'
import type { ModalRef } from '#/shared/ui/Modal'
import { BecomeSellerModal } from '#/widgets/BecomeSellerModal'
import { Modal } from '#/shared/ui/Modal'
import { LoginRequired } from '#/widgets/LoginRequired'
import { useProfileStore } from '#/shared/stores/profileStore'

export const Services = () => {
  const navigate = useNavigate()
  const becomeSellerRef = useRef<BecomeSellerModalRef>(null)
  const loginModalRef = useRef<ModalRef>(null)
  const profile = useProfileStore((s) => s.profile)
  const { t } = useTranslation()

  const handleFavoritesClick = () => {
    if (profile) {
      navigate({ to: '/profile/favorites' })
    } else {
      loginModalRef.current?.open()
    }
  }

  const services = [
    {
      title: t('services.tiles.stores'),
      image: '/illustrations/stores-bg.png',
      onClick: () => navigate({ to: '/stores' }),
    },
    {
      title: t('services.tiles.brands'),
      image: '/illustrations/brands-bg.png',
      onClick: () => navigate({ to: '/brands' }),
    },
    {
      title: t('services.tiles.favorites'),
      image: '/illustrations/favorites-bg.png',
      onClick: handleFavoritesClick,
    },
    {
      title: t('services.tiles.becomeStore'),
      image: '/illustrations/become-store-bg.png',
      onClick: () => becomeSellerRef.current?.open(),
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 min-[650px]:grid-cols-4 gap-2">
        {services.map((item, index) => (
          <button className="relative" key={index} onClick={item.onClick}>
            {/* Соотношение взято у самих иллюстраций (693×320). Стояло 2.5 с
                object-cover, из-за чего сверху и снизу срезалось около 13% —
                у сердца и звёзд были обрублены края. */}
            <img src={item.image} alt="" className="w-full aspect-[693/320] object-cover" />
            <p className="t1 absolute top-2 right-2 left-2 font-medium text-white text-right">
              {item.title}
            </p>
          </button>
        ))}
      </div>
      <BecomeSellerModal ref={becomeSellerRef} />
      <Modal ref={loginModalRef} className="w-137.5">
        <LoginRequired
          onClose={() => loginModalRef.current?.close()}
          description={t('services.loginRequired.favoritesDescription')}
        />
      </Modal>
    </>
  )
}
