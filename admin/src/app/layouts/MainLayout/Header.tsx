import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { useSidebarStore } from '@/shared/store/sidebarStore'
import { Button } from '@/shared/ui/button'
import { LanguageSwitcher } from '@/widgets/LanguageSwither'
import { ThemeSwither } from '@/widgets/ThemeSwither'

interface Props {
  height: number
  onMenuClick: () => void
}

const routeLabelKeys: Record<string, string> = {
  '/': 'pages.dashboard',
  '/categories': 'pages.categories',
  '/categories/create': 'pages.createCategory',
  '/brands': 'pages.brands',
  '/brands/create': 'pages.createBrand',
  '/countries': 'pages.countries',
  '/countries/create': 'pages.createCountry',
  '/regions': 'pages.regions',
  '/regions/create': 'pages.createRegion',
  '/cities': 'pages.cities',
  '/cities/create': 'pages.createCity',
  '/currencies': 'pages.currencies',
  '/currencies/create': 'pages.createCurrency',
  '/measure-units': 'pages.measureUnits',
  '/measure-units/create': 'pages.createMeasureUnit',
  '/users': 'pages.users',
  '/users/create': 'pages.createUser',
  '/banners': 'pages.banners',
  '/banners/create': 'pages.createBanner',
  '/collections': 'pages.collections',
  '/collections/create': 'pages.createCollection',
  '/delivery-message': 'pages.deliveryMessage',
  '/contact-us': 'pages.contactUs',
  '/warehouses': 'pages.warehouses',
  '/warehouses/create': 'pages.createWarehouse',
  '/goods-receiving': 'pages.goodsReceiving',
  '/goods-receiving/create': 'pages.createGoodsReceiving',
  '/pickup-points': 'pages.pickupPoints',
  '/pickup-points/create': 'pages.createPickupPoint',
  '/stores': 'pages.stores',
  '/become-store-requests': 'pages.becomeStoreRequests',
  '/orders': 'pages.orders',
  '/product-moderation': 'pages.productModeration',
  '/review-moderation': 'pages.reviewModeration',
  '/return-requests': 'pages.returnRequests',
  '/profile': 'pages.profile',
  '/account-settings': 'pages.accountSettings',
}

const dynamicRoutePatterns: Record<string, string> = {
  '/categories/:id/edit': 'pages.editCategory',
  '/brands/:id/edit': 'pages.editBrand',
  '/countries/:id/edit': 'pages.editCountry',
  '/regions/:id/edit': 'pages.editRegion',
  '/cities/:id/edit': 'pages.editCity',
  '/currencies/:id/edit': 'pages.editCurrency',
  '/measure-units/:id/edit': 'pages.editMeasureUnit',
  '/users/:id/edit': 'pages.editUser',
  '/become-store-requests/:id': 'pages.becomeStoreRequestDetail',
  '/banners/:id/edit': 'pages.editBanner',
  '/collections/:id/edit': 'pages.editCollection',
  '/pickup-points/:id/edit': 'pages.editPickupPoint',
  '/warehouses/:id': 'pages.warehouseDetail',
  '/warehouses/:id/edit': 'pages.editWarehouse',
  '/goods-receiving/:id': 'pages.goodsReceivingDetail',
  '/stores/:id': 'pages.storeDetail',
  '/orders/:id': 'pages.orderDetail',
  '/product-moderation/:id': 'pages.productModerationDetail',
}

function matchDynamicRoute(pathname: string): string | undefined {
  for (const [pattern, labelKey] of Object.entries(dynamicRoutePatterns)) {
    const regex = new RegExp('^' + pattern.replace(':id', '\\d+') + '$')
    if (regex.test(pathname)) return labelKey
  }
  return undefined
}

function useBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return [{ path: '/', labelKey: routeLabelKeys['/'] }]
  }

  const crumbs: { path: string; labelKey: string | undefined }[] = []

  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/')
    crumbs.push({ path, labelKey: routeLabelKeys[path] })
  }

  const dynamicLabel = matchDynamicRoute(pathname)
  if (dynamicLabel) {
    const parentPath = '/' + segments[0]
    return [
      { path: parentPath, labelKey: routeLabelKeys[parentPath] },
      { path: pathname, labelKey: dynamicLabel },
    ]
  }

  return crumbs.filter((c) => c.labelKey)
}

export const Header = ({ height, onMenuClick }: Props) => {
  const { pathname } = useLocation()
  const { collapsed, toggleCollapsed } = useSidebarStore()
  const { t } = useTranslation()
  const breadcrumbs = useBreadcrumbs(pathname)

  return (
    <header
      style={{ height }}
      className="border-border border-b flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label={t('header.openMenu')}
        >
          <Menu size={20} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </Button>

        <nav className="flex items-center gap-1.5">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
                {isLast ? (
                  <span className="text-sm font-semibold">{t(crumb.labelKey!)}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(crumb.labelKey!)}
                  </Link>
                )}
              </Fragment>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwither />
      </div>
    </header>
  )
}
