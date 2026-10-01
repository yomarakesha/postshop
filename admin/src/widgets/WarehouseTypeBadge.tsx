import { useTranslation } from 'react-i18next'

import { WarehouseType } from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'

/**
 * Тип склада магазина (или части заказа) значком.
 *
 * Тип виден был только на карточке магазина, простым текстом. В списке
 * магазинов и в заказе его не было вовсе: сотрудник не мог понять, кто
 * собирает заказ — продавец у себя (FBS) или склад Postshop (FBO), — не
 * открывая каждый магазин по очереди.
 *
 * `fulfilment` добавляет пояснение, кто собирает: «FBO — собирает склад
 * Postshop». Нужен там, где от типа зависит действие сотрудника (заказ).
 */
export function WarehouseTypeBadge({
  type,
  fulfilment = false,
}: {
  type: WarehouseType | null | undefined
  fulfilment?: boolean
}) {
  const { t } = useTranslation()

  if (!type) {
    return <span className="text-sm text-muted-foreground">{t('warehouseType.none')}</span>
  }

  return (
    <Badge variant={type === WarehouseType.FBO ? 'info' : 'default'}>
      {fulfilment ? t(`warehouseType.fulfilment.${type}`) : t(`warehouseType.${type}`)}
    </Badge>
  )
}
