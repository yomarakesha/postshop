import { useRef } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Home, Store, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ModalRef } from '#/shared/ui/Modal'
import HeartIcon from '#/shared/assets/icons/heart.svg?react'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RegistrationStatus } from '#/shared/openapi/requests'
import { Modal } from '#/shared/ui/Modal'
import { LoginRequired } from '#/widgets/LoginRequired'
import { StoreSelectModal } from '#/widgets/Header/ui/StoreSelectModal'

const navItemsBefore = [
  { key: 'home', to: '/', icon: Home, matchPath: '/', protected: false },
  {
    key: 'favorites',
    to: '/profile/favorites',
    icon: HeartIcon,
    matchPath: '/profile/favorites',
    protected: true,
  },
] as const

const navItemsAfter = [
  { key: 'profile', to: '/profile', icon: User, matchPath: '/profile', protected: true },
] as const

export const MobileBottomNav = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const profile = useProfileStore((s) => s.profile)
  const loginRequiredRef = useRef<ModalRef>(null)

  // Вход определялся как «есть имя И фамилия»: вошедший по SMS пользователь
  // с незаполненным именем считался гостем и не мог попасть в профиль.
  const isLoggedIn = !!profile
  const approvedShops =
    profile?.shops?.filter((shop) => shop.registration_status === RegistrationStatus.APPROVED) ?? []
  const isStoreActive = pathname.startsWith('/my-store')

  return (
    <>
      {/* z-40, как у шапки: без слоя панель оказывалась под содержимым, и
          кнопки «+» на карточках товара рисовались поверх неё.
          Модалки и выдвижные панели (z-50/z-60) по-прежнему её накрывают. */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stroke lg:hidden">
        <div className="flex items-center justify-around py-2 px-1 max-w-(--page-max-width) mx-auto">
          {[...navItemsBefore, ...navItemsAfter].map(
            ({ key, to, icon: Icon, matchPath, protected: isProtected }, i) => {
              const isActive =
                key === 'home'
                  ? pathname === '/'
                  : key === 'profile'
                    ? pathname.startsWith('/profile') && !pathname.startsWith('/profile/favorites')
                    : pathname.startsWith(matchPath)
              const needsAuth = isProtected && !isLoggedIn
              const label =
                key === 'profile' && needsAuth ? t('login.openButton') : t(`footer.${key}` as const)

              const content = (
                <>
                  <Icon height={24} width={24} />
                  <span className="t2 font-medium">{label}</span>
                </>
              )

              const className = `flex flex-col items-center gap-0.5 min-w-14 transition-colors ${
                isActive ? 'text-blue-main' : 'text-passive1'
              }`

              // Модалка «нужен вход» была отрисована ниже, но не открывалась
              // никогда: гость просто переходил по ссылке на закрытый раздел и
              // видел пустой экран. Признак needsAuth считался и не влиял ни
              // на что.
              const tab = needsAuth ? (
                <button
                  key={key}
                  type="button"
                  onClick={() => loginRequiredRef.current?.open()}
                  className={className}
                >
                  {content}
                </button>
              ) : (
                <Link key={key} to={to} className={className}>
                  {content}
                </Link>
              )

              // Insert store tab after favorites (index 1)
              if (i === navItemsBefore.length - 1 && approvedShops.length > 0) {
                const tabClass = `flex flex-col items-center gap-0.5 min-w-14 transition-colors ${isStoreActive ? 'text-blue-main' : 'text-passive1'}`
                const storeTab =
                  approvedShops.length === 1 ? (
                    <Link
                      key="store"
                      to="/my-store/$storeId"
                      params={{ storeId: String(approvedShops[0].id) }}
                      className={tabClass}
                    >
                      <Store size={24} />
                      <span className="t2 font-medium">{t('header.myStore')}</span>
                    </Link>
                  ) : (
                    <StoreSelectModal key="store" shops={approvedShops} className={tabClass} />
                  )
                return [tab, storeTab]
              }

              return tab
            },
          )}
        </div>
      </nav>

      <Modal ref={loginRequiredRef}>
        <LoginRequired
          onClose={() => loginRequiredRef.current?.close()}
          description={t('services.loginRequired.favoritesDescription')}
        />
      </Modal>
    </>
  )
}
