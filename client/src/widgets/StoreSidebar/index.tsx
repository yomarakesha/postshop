import { Link, useParams, useRouterState } from '@tanstack/react-router'
import {
  Boxes,
  ChartNoAxesCombined,
  Info,
  PackagePlus,
  PackageX,
  Power,
  PowerOff,
  ShieldCheck,
  Warehouse,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFeatures } from '#/shared/hooks/useFeatures'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import BoxIcon from '#/shared/assets/icons/box.svg?react'
import BasketIcon from '#/shared/assets/icons/basket.svg?react'
import ListChecksIcon from '#/shared/assets/icons/list-checks.svg?react'
import ApprovedIcon from '#/shared/assets/icons/approved.svg?react'
import { cn } from '#/shared/utils/cn'
import { Spinner } from '#/shared/ui/Spinner'
import { useProfileStore } from '#/shared/stores/profileStore'
import { RegistrationStatus, WarehouseType } from '#/shared/openapi/requests'

export const StoreSidebar = () => {
  const { t } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const { data: shopAdditional, isLoading } = useShopAdditional(Number(storeId))

  // Галочка «одобрен» рисовалась всегда, независимо от статуса заявки: магазин
  // на проверке и отклонённый выглядели одобренными.
  const shop = useProfileStore((state) =>
    state.profile?.shops?.find((x) => x.id === Number(storeId)),
  )
  const isApproved = shop?.registration_status === RegistrationStatus.APPROVED
  // FBS и FBO — разные способы работы, и у каждого свои разделы. Магазин FBS
  // хранит товар сам: ему «Остатки» и «Приём товара». Магазин FBO держит товар
  // на складе Postshop: ему «Склад» — остатки там и отправка товара туда.
  const { fboEnabled } = useFeatures()
  const warehouseType = shopAdditional?.warehouse_type
  const isFbs = warehouseType === WarehouseType.FBS
  const isFbo = warehouseType === WarehouseType.FBO
  // Страница за этим пунктом сама переключается между закрытием и открытием,
  // а пункт меню всегда говорил «Закрыть магазин» — у закрытого магазина это
  // предлагало сделать то, что уже сделано. Красный тут тоже неуместен:
  // открытие магазина — действие созидательное, а не опасное.
  const isClosed = Boolean(shop && !shop.is_active)

  const logoUrl = shopAdditional?.logo_path
    ? shopAdditional.logo_path.startsWith('http')
      ? shopAdditional.logo_path
      : import.meta.env.VITE_BACKEND_API_URL + '/' + shopAdditional.logo_path
    : undefined

  const links = [
    {
      title: t('storeSidebar.dashboard'),
      href: `/my-store/${storeId}`,
      icon: ChartNoAxesCombined,
    },
    {
      title: t('storeSidebar.orders'),
      href: `/my-store/${storeId}/orders`,
      icon: BoxIcon,
    },
    {
      title: t('storeSidebar.products'),
      href: `/my-store/${storeId}/products`,
      icon: BasketIcon,
    },
    {
      // Возвраты были только числом на панели показателей: продавец видел, что
      // товар вернули, и не мог посмотреть ни причину, ни кто именно.
      title: t('storeReturns.title'),
      href: `/my-store/${storeId}/returns`,
      icon: PackageX,
    },
    {
      title: t('storeSidebar.storeInformation'),
      href: `/my-store/${storeId}/store-information`,
      icon: Info,
    },
    ...(isFbs
      ? [
          {
            title: t('stock.title'),
            href: `/my-store/${storeId}/stock`,
            icon: Boxes,
          },
          {
            title: t('intake.title'),
            href: `/my-store/${storeId}/intake`,
            icon: PackagePlus,
          },
        ]
      : []),
    // «Склад» — только FBO и только пока платформа принимает товар на хранение.
    ...(isFbo && fboEnabled
      ? [
          {
            title: t('warehouse.title'),
            href: `/my-store/${storeId}/warehouse`,
            icon: Warehouse,
          },
        ]
      : []),
    {
      title: t('storeSidebar.agreement'),
      href: `/my-store/${storeId}/terms-of-use`,
      icon: ListChecksIcon,
    },
    {
      title: t('storeSidebar.privacyPolicy'),
      href: `/my-store/${storeId}/privacy-policy`,
      icon: ShieldCheck,
    },
    {
      // Раньше пункт вёл на страницу удаления аккаунта с кнопкой без
      // обработчика: удаления магазина в API нет. Теперь ведёт на закрытие —
      // единственный выключатель, который в системе действительно есть.
      title: isClosed ? t('storeClose.reopenTitle') : t('storeSidebar.closeStore'),
      href: `/my-store/${storeId}/close`,
      icon: isClosed ? Power : PowerOff,
      isRed: !isClosed,
      // Синий — как у кнопки «Открыть магазин» на самой странице: одно
      // действие не должно выглядеть в меню иначе, чем там, куда оно ведёт.
      isBlue: isClosed,
    },
  ]

  return (
    <>
      {/* Mobile nav */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="relative flex items-center gap-3 bg-white p-3 rounded-base shadow-base">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={shopAdditional?.name ?? ''}
                  className="w-10 h-10 object-contain shrink-0"
                />
              )}
              {/* Значок «проверено» относится к названию, а не к карточке:
                  прибитый к её углу, он выглядел случайной наклейкой и
                  налезал на соседний блок. */}
              <p className="p3 font-semibold flex-1 flex items-center gap-1.5">
                <span className="truncate">{shopAdditional?.name ?? ''}</span>
                {isApproved && <ApprovedIcon className="size-4 shrink-0" />}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-(--page-horizontal-padding) px-(--page-horizontal-padding) scrollbar-none">
          {links.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 min-w-16 bg-white p-2 rounded-base shadow-base shrink-0',
                  isActive && !item.isRed && 'bg-blue2 text-blue-main',
                  item.isRed && 'text-failure',
                  item.isBlue && 'text-blue-main',
                )}
              >
                <item.icon
                  width={20}
                  height={20}
                  className={cn(
                    isActive && !item.isRed ? 'text-blue-main' : 'text-passive2',
                    item.isRed && 'text-failure',
                    item.isBlue && 'text-blue-main',
                  )}
                />
                <span className="t2 font-medium text-center leading-tight">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-65 max-w-65 flex-col gap-2 sticky top-(--page-content-top-padding) self-start">
        <div className="relative flex flex-col items-center gap-4 w-full bg-white p-4 rounded-base shadow-base">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={shopAdditional?.name ?? ''}
                  className="w-full max-w-25 h-15 object-contain"
                />
              )}
              <p className="p2 font-semibold text-center flex items-center justify-center gap-1.5">
                <span>{shopAdditional?.name ?? ''}</span>
                {isApproved && <ApprovedIcon className="size-5 shrink-0" />}
              </p>
            </>
          )}
        </div>

        {links.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              /* Наведение — как в меню профиля: активный пункт уже подсвечен,
                 «закрыть магазин» подсвечивается красным. */
              className={cn(
                'flex items-center gap-2 w-full bg-white p-4 rounded-base shadow-base transition-colors',
                isActive && !item.isRed && 'bg-blue2 text-blue-main',
                item.isRed ? 'text-failure hover:bg-failure/8' : !isActive && 'hover:bg-gray2',
                item.isBlue && 'text-blue-main',
              )}
            >
              <item.icon
                width={20}
                height={20}
                className={cn(
                  isActive && !item.isRed ? 'text-blue-main' : 'text-passive2',
                  item.isRed && 'text-failure',
                  item.isBlue && 'text-blue-main',
                )}
              />
              <p className="p3 font-medium">{item.title}</p>
            </Link>
          )
        })}
      </aside>
    </>
  )
}
