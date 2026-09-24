import { PackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import { useGetShopTopProductsOrdersShopShopIdTopProductsGet } from '#/shared/openapi/queries'
import { getImageUrl } from '#/shared/utils/getImageUrl'

export const TopProducts = () => {
  const { t, i18n } = useTranslation()
  const { storeId } = useParams({ from: '/my-store/$storeId' })
  const currency = t('dashboard.revenue.currency')

  const { data: topProducts = [], isLoading } = useGetShopTopProductsOrdersShopShopIdTopProductsGet(
    { path: { shop_id: Number(storeId) }, query: { limit: 4 } },
  )

  const getProductName = (translations: Array<{ language: string; name: string }>) =>
    translations.find((tr) => tr.language === i18n.language)?.name ?? translations[0]?.name

  return (
    <div className="p-5">
      <p className="p2 font-semibold">{t('dashboard.topProducts.title')}</p>

      {isLoading && (
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-base bg-gray2 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && topProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-passive2">
          <PackageSearch size={28} />
          <p className="t1 font-medium">{t('dashboard.topProducts.empty')}</p>
        </div>
      )}

      {!isLoading && topProducts.length > 0 && (
        <div className="flex flex-col mt-2 divide-y divide-stroke">
          {topProducts.map((item, index) => (
            <div key={item.product.id} className="flex items-center gap-3 py-2.5">
              <span className="t2 text-passive1 w-3 text-center shrink-0">{index + 1}</span>
              <div className="w-10 h-10 rounded-md bg-gray2 overflow-hidden shrink-0">
                <img
                  src={getImageUrl(item.product.images?.[0])}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="p3 font-medium flex-1 min-w-0 truncate">
                {getProductName(item.product.translations)}
              </p>
              <p className="p3 font-medium text-passive2 whitespace-nowrap">
                {Number(item.total_revenue)} {currency}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== Previous design: numbered rank badge + relative revenue bar =====
      <div className="rounded-base bg-white border border-stroke shadow-base overflow-hidden">
        <p className="p2 font-semibold border-b border-stroke p-4">
          {t('dashboard.topProducts.title')}
        </p>

        {!isLoading && topProducts.length > 0 && (
          <div className="flex flex-col divide-y divide-stroke">
            {topProducts.map((item, index) => {
              const revenue = Number(item.total_revenue)
              const maxRevenue = Math.max(...topProducts.map((p) => Number(p.total_revenue)), 0)
              const barWidth = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, 6) : 0
              return (
                <div key={item.product.id} className="flex items-center gap-3 p-4">
                  <span className="t1 font-bold text-passive1 w-4 text-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-gray2 overflow-hidden shrink-0 ring-1 ring-stroke">
                    <img
                      src={getImageUrl(item.product.images?.[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="p3 font-medium truncate">
                      {getProductName(item.product.translations)}
                    </p>
                    <div className="h-1.5 rounded-full bg-gray2 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-main"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <p className="p3 font-semibold whitespace-nowrap ml-2 shrink-0">
                    {revenue} {currency}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
      ===== End previous design (rank badge + bar) ===== */}

      {/* ===== Earlier design: plain thumbnail/name/price rows =====
      {!isLoading && topProducts.length > 0 && (
        <div className="flex flex-col gap-4.5 p-6">
          {topProducts.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray2 overflow-hidden shrink-0">
                  <img
                    src={getImageUrl(item.product.images?.[0])}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="p3 font-medium">{getProductName(item.product.translations)}</p>
              </div>
              <p className="p3 font-medium text-passive2 whitespace-nowrap ml-4">
                {Number(item.total_revenue)} {currency}
              </p>
            </div>
          ))}
        </div>
      )}
      ===== End earlier design (plain rows) ===== */}
    </div>
  )
}
