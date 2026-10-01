import {
  Building2,
  ClipboardList,
  Coins,
  Globe,
  Grid3X3,
  Image,
  LayoutDashboard,
  Library,
  Mail,
  Map,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Ruler,
  ShieldCheck,
  PackageX,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react'
import { motion } from 'motion/react'
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { AccountDropdown } from './AccountDropdown'
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './index'
import { SidebarItem } from './SidebarItem'
import { SidebarSection } from './SidebarSection'
import { PERMISSION_KEYS } from '@/shared/constants/PermissionKeys'
import { useDraftReceiptsCountQuery } from '@/shared/hooks/useDraftReceiptsCountQuery'
import { useFeatures } from '@/shared/hooks/useFeatures'
import { useHasPermission } from '@/shared/hooks/useHasPermission'
import { useModerationCountQuery } from '@/shared/hooks/useModerationCountQuery'
import { usePendingOrdersCountQuery } from '@/shared/hooks/usePendingOrdersCountQuery'
import { usePendingShopsCountQuery } from '@/shared/hooks/usePendingShopsCountQuery'
import { useReturnsCountQuery } from '@/shared/hooks/useReturnsCountQuery'
import { useReviewModerationCountQuery } from '@/shared/hooks/useReviewModerationCountQuery'
import { useSidebarStore } from '@/shared/store/sidebarStore'
import { cn } from '@/shared/utils'

interface Props {
  headerHeight: number
  open: boolean
  onClose: () => void
}

const sidebarTransition = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const

export const Sidebar = ({ headerHeight, open, onClose }: Props) => {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const { t } = useTranslation()
  const { hasPermission } = useHasPermission()
  const { data: pendingCountData } = usePendingShopsCountQuery()
  const pendingCount = (pendingCountData?.data as { count: number } | undefined)?.count ?? 0
  const { data: moderationCountData } = useModerationCountQuery()
  const { data: reviewCountData } = useReviewModerationCountQuery()
  const { data: returnsCountData } = useReturnsCountQuery()
  const { fboEnabled } = useFeatures()
  const { data: draftReceipts } = useDraftReceiptsCountQuery(fboEnabled)
  const moderationCount = (moderationCountData?.data as { count: number } | undefined)?.count ?? 0
  const reviewCount = (reviewCountData?.data as { count: number } | undefined)?.count ?? 0
  const returnsCount = (returnsCountData?.data as { count: number } | undefined)?.count ?? 0
  const receiptsCount = draftReceipts ?? 0
  // Счётчик новых заказов видит только тот, кто может их принять: ручка
  // отвечает 403 без права менять статус заказа.
  const { data: ordersCountData } = usePendingOrdersCountQuery(
    hasPermission(PERMISSION_KEYS.ORDERS.updateStatus),
  )
  const ordersCount = (ordersCountData?.data as { count: number } | undefined)?.count ?? 0

  const renderSection = (
    title: string,
    items: {
      href: string
      icon: ReactNode
      title: string
      permission?: string
      badge?: number
    }[],
  ) => {
    const visibleItems = items.filter((item) => hasPermission(item.permission))
    if (visibleItems.length === 0) return null

    return (
      <SidebarSection title={title} collapsed={collapsed}>
        {visibleItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            onNavigate={onClose}
            collapsed={collapsed}
            badge={item.badge}
          />
        ))}
      </SidebarSection>
    )
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className={cn(
          'fixed top-0 left-0 z-40 h-screen px-3 flex flex-col gap-2 py-2 bg-background overflow-hidden',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:transition-none transition-transform duration-300 ease-in-out',
        )}
        initial={false}
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        transition={sidebarTransition}
      >
        <Link
          className="flex items-center justify-center px-2 border-b border-border overflow-hidden shrink-0"
          style={{ height: headerHeight }}
          to="/"
        >
          <motion.div
            initial={false}
            animate={{ width: collapsed ? 42 : 100, height: collapsed ? 32 : 45 }}
            transition={sidebarTransition}
            className="relative shrink-0"
          >
            <img
              src="/logo.webp"
              alt="PostShop"
              width="100%"
              height="100%"
              className="object-contain absolute inset-0 w-full h-full"
            />
          </motion.div>
        </Link>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 mt-2 border-b border-border scrollbar-hide">
          <div>
            <SidebarItem
              href="/"
              icon={<LayoutDashboard size={18} />}
              title={t('pages.dashboard')}
              onNavigate={onClose}
              collapsed={collapsed}
            />
          </div>

          {renderSection(t('sidebar.catalog'), [
            {
              href: '/categories',
              icon: <Grid3X3 size={18} />,
              title: t('pages.categories'),
              permission: PERMISSION_KEYS.CATEGORIES.read,
            },
            {
              href: '/brands',
              icon: <Tag size={18} />,
              title: t('pages.brands'),
              permission: PERMISSION_KEYS.BRANDS.read,
            },
            {
              href: '/banners',
              icon: <Image size={18} />,
              title: t('pages.banners'),
              permission: PERMISSION_KEYS.BANNERS.read,
            },
            {
              href: '/collections',
              icon: <Library size={18} />,
              title: t('pages.collections'),
              permission: PERMISSION_KEYS.COLLECTIONS.read,
            },
          ])}

          {/* Эти три пункта передавались без права, а помощник для undefined
              возвращал «разрешено» — их видел любой вошедший. */}
          {renderSection(t('sidebar.stores'), [
            {
              href: '/stores',
              icon: <Store size={18} />,
              title: t('pages.stores'),
              permission: PERMISSION_KEYS.SHOPS.read,
            },
            {
              href: '/orders',
              icon: <ShoppingBag size={18} />,
              title: t('pages.orders'),
              permission: PERMISSION_KEYS.ORDERS.read,
              badge: ordersCount,
            },
            {
              href: '/pickup-points',
              icon: <MapPin size={18} />,
              title: t('pages.pickupPoints'),
              permission: PERMISSION_KEYS.PICKUP_POINTS.read,
            },
          ])}

          {renderSection(t('sidebar.moderation'), [
            {
              href: '/product-moderation',
              icon: <ShieldCheck size={18} />,
              title: t('pages.productModeration'),
              permission: PERMISSION_KEYS.PRODUCTS.moderate,
              badge: moderationCount,
            },
            {
              href: '/review-moderation',
              icon: <Star size={18} />,
              title: t('pages.reviewModeration'),
              permission: PERMISSION_KEYS.REVIEWS.moderate,
              badge: reviewCount,
            },
            {
              href: '/return-requests',
              icon: <PackageX size={18} />,
              title: t('pages.returnRequests'),
              permission: PERMISSION_KEYS.RETURNS.manage,
              badge: returnsCount,
            },
            {
              href: '/become-store-requests',
              icon: <ClipboardList size={18} />,
              title: t('pages.becomeStoreRequests'),
              permission: PERMISSION_KEYS.SHOPS.update,
              badge: pendingCount,
            },
          ])}

          {/* Секция была целиком закомментирована, а страницы за ней —
              рабочими: склады отдавали таблицу с реальными записями, приёмка —
              документ. Вместе с ними были недостижимы создание и правка
              склада, создание и просмотр приёмки. */}
          {/* Склады и приёмка — сторона FBO: товар магазина хранит платформа.
              Выключается на бэкенде флагом FBO_ENABLED; пока он выключен,
              платформа товар не принимает — показывать разделы незачем. */}
          {fboEnabled &&
            renderSection(t('sidebar.warehousesAndProducts'), [
              {
                href: '/warehouses',
                icon: <Warehouse size={18} />,
                title: t('pages.warehouses'),
                permission: PERMISSION_KEYS.WAREHOUSES.read,
              },
              {
                href: '/goods-receiving',
                icon: <PackageCheck size={18} />,
                title: t('pages.goodsReceiving'),
                permission: PERMISSION_KEYS.STOCK_RECEIPTS.read,
                // Документ приёмки ждёт действия сотрудника, как заявка или
                // товар на модерации, — без отметки его не замечали.
                badge: receiptsCount,
              },
            ])}

          {renderSection(t('sidebar.geography'), [
            {
              href: '/countries',
              icon: <Globe size={18} />,
              title: t('pages.countries'),
              permission: PERMISSION_KEYS.COUNTRIES.read,
            },
            {
              href: '/regions',
              icon: <Map size={18} />,
              title: t('pages.regions'),
              permission: PERMISSION_KEYS.REGIONS.read,
            },
            {
              href: '/cities',
              icon: <Building2 size={18} />,
              title: t('pages.cities'),
              permission: PERMISSION_KEYS.CITIES.read,
            },
          ])}

          {renderSection(t('sidebar.management'), [
            {
              href: '/currencies',
              icon: <Coins size={18} />,
              title: t('pages.currencies'),
              permission: PERMISSION_KEYS.CURRENCIES.read,
            },
            {
              href: '/measure-units',
              icon: <Ruler size={18} />,
              title: t('pages.measureUnits'),
              permission: PERMISSION_KEYS.MEASURE_UNITS.read,
            },
            {
              href: '/users',
              icon: <Users size={18} />,
              title: t('pages.users'),
              permission: PERMISSION_KEYS.USERS.read,
            },
            {
              href: '/delivery-message',
              icon: <MessageSquareText size={18} />,
              title: t('pages.deliveryMessage'),
              permission: PERMISSION_KEYS.DELIVERY_MESSAGE.read,
            },
            {
              href: '/contact-us',
              icon: <Mail size={18} />,
              title: t('pages.contactUs'),
              permission: PERMISSION_KEYS.CONTACT_US.read,
            },
          ])}
        </div>

        <AccountDropdown collapsed={collapsed} />
      </motion.div>
    </>
  )
}
