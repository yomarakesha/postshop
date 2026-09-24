import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { BarChart3, MapPin, PackageX, Pencil, ShieldCheck, Store } from 'lucide-react'
import type { RefObject } from 'react'
import type { BecomeSellerModalRef } from '#/widgets/BecomeSellerModal'
import BoxIcon from '#/shared/assets/icons/box.svg?react'
import HeartIcon from '#/shared/assets/icons/heart.svg?react'
import BasketIcon from '#/shared/assets/icons/basket.svg?react'
import ListChecksIcon from '#/shared/assets/icons/list-checks.svg?react'
import LogOutIcon from '#/shared/assets/icons/logout.svg?react'
import { cn } from '#/shared/utils/cn'
import { RegistrationStatus } from '#/shared/openapi/requests'
import { useProfileStore } from '#/shared/stores/profileStore'

interface ProfileSidebarProps {
  becomeSellerRef: RefObject<BecomeSellerModalRef | null>
}

export const ProfileSidebar = ({ becomeSellerRef }: ProfileSidebarProps) => {
  const { t } = useTranslation()
  const profile = useProfileStore((s) => s.profile)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const hasShops =
    (profile?.shops?.filter((shop) => shop.registration_status === RegistrationStatus.APPROVED)
      .length ?? 0) > 0

  const links = [
    {
      title: t('storeSidebar.orders'),
      href: '/profile',
      icon: BoxIcon,
    },
    {
      title: t('storeSidebar.favorites'),
      href: '/profile/favorites',
      icon: HeartIcon,
    },
    {
      title: t('storeSidebar.cart'),
      href: '/profile/cart',
      icon: BasketIcon,
    },
    {
      title: t('addresses.title'),
      href: '/profile/addresses',
      icon: MapPin,
    },
    {
      title: t('returns.title'),
      href: '/profile/returns',
      icon: PackageX,
    },
    // Аналитика показывается только владельцам магазинов: без магазина на
    // странице было бы нечего считать.
    ...(hasShops
      ? [
          {
            title: t('storeSidebar.analytics'),
            href: '/profile/analytics' as const,
            icon: BarChart3,
          },
        ]
      : []),
    {
      title: t('storeSidebar.becomeSeller'),
      icon: Store,
      action: 'becomeSeller' as const,
    },
    {
      title: t('storeSidebar.agreement'),
      href: '/profile/terms-of-use',
      icon: ListChecksIcon,
    },
    {
      title: t('storeSidebar.privacyPolicy'),
      href: '/profile/privacy-policy',
      icon: ShieldCheck,
    },
    {
      title: t('storeSidebar.logout'),
      href: '/profile/logout',
      icon: LogOutIcon,
      isRed: true,
    },
  ]

  const formattedPhone = profile?.phone
    ? profile.phone.replace(/\+?(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5')
    : null

  return (
    <>
      {/* Mobile nav */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="bg-white shadow-base p-3 rounded-base relative flex items-center gap-3">
          <div className="flex-1">
            <p className="p3 font-medium">
              {profile?.name} {profile?.surname}
            </p>
            {formattedPhone && <p className="t2 text-passive2">{formattedPhone}</p>}
          </div>
          <Link to="/profile/edit" className="text-passive2 hover:text-blue-main shrink-0">
            <Pencil width={16} height={16} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-(--page-horizontal-padding) px-(--page-horizontal-padding) scrollbar-none">
          {links.map((item) => {
            const isActive = item.href ? pathname === item.href : false
            const iconEl = (
              <item.icon
                width={20}
                height={20}
                className={cn(
                  item.isRed ? 'text-failure' : isActive ? 'text-blue-main' : 'text-passive2',
                )}
              />
            )
            const itemClasses = cn(
              'flex flex-col items-center gap-1 min-w-16 bg-white p-2 rounded-base shadow-base shrink-0',
              item.isRed ? 'text-failure' : isActive && 'bg-blue2 text-blue-main',
            )

            if ('action' in item) {
              return (
                <button
                  key={item.title}
                  onClick={() => becomeSellerRef.current?.open()}
                  className={itemClasses}
                >
                  {iconEl}
                  <span className="t2 font-medium text-center leading-tight">{item.title}</span>
                </button>
              )
            }

            return (
              <Link key={item.title} to={item.href} className={itemClasses}>
                {iconEl}
                <span className="t2 font-medium text-center leading-tight">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-65 max-w-65 flex-col gap-4 sticky top-(--page-content-top-padding) self-start">
        <div className="bg-white shadow-base p-4 rounded-base relative">
          <Link
            to="/profile/edit"
            className="absolute top-3 right-3 text-passive2 hover:text-blue-main"
          >
            <Pencil width={16} height={16} />
          </Link>
          <div className="p3 font-medium flex flex-col gap-0.5 pr-6">
            <p>
              {profile?.name} {profile?.surname}
            </p>
            <p>{formattedPhone}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {links.map((item) => {
            const isActive = item.href ? pathname === item.href : false
            // Пункты меню — ссылки и кнопки, но под курсором ничего не
            // менялось: колонка карточек выглядела списком подписей. Активный
            // пункт уже подсвечен, его наведение не трогаем; у «выйти» подсветка
            // красная — действие необратимое, и цвет об этом предупреждает.
            const classes = cn(
              'flex items-center gap-2 w-full bg-white p-4 rounded-base shadow-base transition-colors',
              item.isRed
                ? 'text-failure hover:bg-failure/8'
                : isActive
                  ? 'bg-blue2 text-blue-main'
                  : 'hover:bg-gray2',
            )
            const iconEl = (
              <item.icon
                width={20}
                height={20}
                className={cn(
                  item.isRed ? 'text-failure' : isActive ? 'text-blue-main' : 'text-passive2',
                )}
              />
            )

            if ('action' in item) {
              return (
                <button
                  key={item.title}
                  onClick={() => becomeSellerRef.current?.open()}
                  className={classes}
                >
                  {iconEl}
                  <p className="p3 font-medium">{item.title}</p>
                </button>
              )
            }

            return (
              <Link key={item.title} to={item.href} className={classes}>
                {iconEl}
                <p className="p3 font-medium">{item.title}</p>
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}
