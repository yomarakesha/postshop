import { ProductItem } from './ProductItem'
import type { ReactNode } from 'react'
import type { OrderStatus } from '..'
import { cn } from '#/shared/utils/cn'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '#/shared/ui/Accordion'

interface OrderProduct {
  /** Номер строки заказа: он уникален и служит ключом списка. */
  id: number
  /**
   * Номер самого товара.
   *
   * Отдельное поле, потому что `id` — это строка заказа, а не товар. Действие
   * над товаром (оценить) требует именно товара, и раньше туда уходил номер
   * строки: сервер отвечал «этот товар вы не покупали».
   */
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  warning?: string
}

interface OrderStore {
  id: number
  name: string
  logo?: string
  products: Array<OrderProduct>
  collapsed?: boolean
}

export const ExpandableStore = ({
  store,
  status,
  renderProductAction,
}: {
  store: OrderStore
  status: OrderStatus
  renderProductAction?: (product: OrderProduct) => ReactNode
}) => {
  const hasWarning = status === 'attention' && store.products.some((p) => p.warning)

  return (
    <Accordion type="multiple" defaultValue={[]}>
      <AccordionItem value={`store-${store.id}`} className="border-none">
        <AccordionTrigger
          className={cn(
            'hover:no-underline',
            hasWarning ? 'border border-failure rounded-base' : 'border-none rounded-none',
          )}
        >
          <div className="flex items-center gap-3">
            {/* Счётчик товаров убран — количество видно по самому списку.
                Строка магазина отделена от товаров линией снизу (см. класс
                триггера): без неё магазин и товар читались как однородные
                строки одного списка. */}
            <img
              src={store.logo}
              alt={store.name}
              className="size-16 shrink-0 rounded-lg object-cover"
            />
            <p className="p3 font-semibold">{store.name}</p>
          </div>
        </AccordionTrigger>
        {/* Линия отделяет магазин от его товаров. Стоит на содержимом, а не на
            строке магазина: у триггера в базовых классах border-none, он гасит
            любую границу. У свёрнутой группы содержимого нет — линии тоже. */}
        <AccordionContent className="border-t border-stroke pt-2">
          <div className="flex flex-col">
            {store.products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                status={status}
                action={renderProductAction?.(product)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
