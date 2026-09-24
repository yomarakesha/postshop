import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { BecomeSellerModalRef } from '@/widgets/BecomeSellerModal'
import playmarket from '@/shared/assets/image/playmarket.png'
import appstore from '@/shared/assets/image/appstore.png'
import ArrowIcon from '@/shared/assets/icons/arrow.svg?react'
import { useProfileStore } from '@/shared/stores/profileStore'
import { BecomeSellerModal } from '@/widgets/BecomeSellerModal'
import { Logo } from '#/shared/ui/Logo'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '#/shared/constants/contact'

export const Footer = () => {
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const becomeSellerRef = useRef<BecomeSellerModalRef>(null)
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const links = [
    [
      { label: t('footer.aboutUs'), to: '/about-us' },
      { label: t('footer.contact'), to: '/contact-us' },
      { label: t('footer.termsOfUse'), to: '/terms-of-use' },
      { label: t('footer.privacyPolicy'), to: '/privacy-policy' },
    ],
    ...(profile?.id
      ? [
          [
            { label: t('footer.profile'), to: '/profile/edit' },
            // «Мои заказы» вело на тот же адрес, что и «Профиль»: две записи
            // подвала из трёх были неотличимы по действию.
            { label: t('footer.myOrders'), to: '/profile' },
            { label: t('footer.favorites'), to: '/profile/favorites' },
          ],
        ]
      : []),
    [
      { label: t('footer.brands'), to: '/brands' },
      { label: t('footer.stores'), to: '/stores' },
      { label: t('footer.becomeSeller'), action: 'becomeSeller' },
    ],
  ]

  return (
    <footer className="hidden lg:flex p-8 shadow-base bg-white rounded-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex gap-2">
          <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
            <img src={playmarket} alt="Google Play" height={40} width={120} />
          </a>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <img src={appstore} alt="App Store" height={40} width={120} />
          </a>
        </div>
      </div>

      <hr className="border-t border-stroke" />

      <div className="flex justify-between items-start">
        <div className="grid grid-cols-3 gap-14">
          {links.map((column, i) => (
            <div key={i} className="flex flex-col gap-3">
              {column.map((item) => (
                <Link
                  key={item.label}
                  to={'to' in item ? item.to : undefined}
                  onClick={'action' in item ? () => becomeSellerRef.current?.open() : undefined}
                  className="t1 text-passive2 hover:text-blue-main transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.75 text-blue-main font-medium cursor-pointer"
        >
          <span className="p3 font-semibold">{t('footer.scrollToTop')}</span>
          <ArrowIcon className="rotate-90 size-5" />
        </button>
      </div>

      <BecomeSellerModal ref={becomeSellerRef} />
    </footer>
  )
}
