import { Link } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { Warehouse } from 'lucide-react'
import type { ReactElement } from 'react'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { WarehouseType } from '#/shared/openapi/requests'

const LINK_CLASS = 'font-medium text-blue-main hover:underline'

interface Props {
  storeId: string
}

/**
 * Тип склада магазина и что из него следует — коротко и со ссылками.
 *
 * Тип склада стоял в списке «Информация о магазине» одной строкой «FBS» без
 * объяснения: тестировщик не понял, что это значит и куда идти дальше. FBS и
 * FBO — разные способы работы с разными разделами кабинета (см. меню
 * магазина), поэтому здесь — смысл в одну строку и по шагу на каждую
 * повседневную задачу, со ссылкой на нужный раздел. Ссылка — внутри фразы
 * через <Trans>: в туркменском и турецком название раздела стоит в другом
 * месте предложения, чем в русском.
 */
export const WarehouseTypeCard = ({ storeId }: Props) => {
  const { t } = useTranslation()
  const { data: shopAdditional } = useShopAdditional(Number(storeId))
  const type = shopAdditional?.warehouse_type

  // Тип ещё не выбран (карточки магазина нет) — объяснять нечего, выбор
  // делается в списке ниже.
  if (type !== WarehouseType.FBS && type !== WarehouseType.FBO) return null

  const link = (to: string, search?: Record<string, string>) => (
    <Link to={to} params={{ storeId }} search={search} className={LINK_CLASS} />
  )

  const steps: Array<{ key: string; link: ReactElement }> =
    type === WarehouseType.FBS
      ? [
          { key: 'storeWarehouse.fbs.intake', link: link('/my-store/$storeId/intake') },
          { key: 'storeWarehouse.fbs.stock', link: link('/my-store/$storeId/stock') },
          { key: 'storeWarehouse.fbs.orders', link: link('/my-store/$storeId/orders') },
          { key: 'storeWarehouse.fbs.returns', link: link('/my-store/$storeId/returns') },
        ]
      : [
          {
            key: 'storeWarehouse.fbo.shipments',
            link: link('/my-store/$storeId/warehouse', { tab: 'shipments' }),
          },
          {
            key: 'storeWarehouse.fbo.stock',
            link: link('/my-store/$storeId/warehouse', { tab: 'stock' }),
          },
          { key: 'storeWarehouse.fbo.orders', link: link('/my-store/$storeId/orders') },
          { key: 'storeWarehouse.fbo.returns', link: link('/my-store/$storeId/returns') },
        ]

  return (
    <section className="flex flex-col gap-3 rounded-base bg-white p-4 shadow-base">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue1">
          <Warehouse width={18} height={18} className="text-blue-main" />
        </div>
        <div className="min-w-0">
          <h2 className="p2 font-bold">
            {t('storeWarehouse.title', { type: type.toUpperCase() })}
          </h2>
          <p className="t1 text-passive2">
            {t(
              type === WarehouseType.FBS
                ? 'storeWarehouse.fbs.meaning'
                : 'storeWarehouse.fbo.meaning',
            )}
          </p>
        </div>
      </div>

      <ul className="flex list-disc flex-col gap-1.5 pl-5 p3">
        {steps.map((step) => (
          <li key={step.key}>
            <Trans i18nKey={step.key} components={{ link: step.link }} />
          </li>
        ))}
      </ul>

      <p className="t1 text-passive2">
        <Trans
          i18nKey="storeWarehouse.changeNote"
          components={{ link: <Link to="/contact-us" className={LINK_CLASS} /> }}
        />
      </p>
    </section>
  )
}
