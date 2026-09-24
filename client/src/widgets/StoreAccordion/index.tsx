import { ProductItem } from './ui/ProductItem'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '#/shared/ui/Accordion'

interface CartProduct {
  id: number
  name: string
  image?: string
  price: number
  oldPrice?: number
  quantity: number
}

interface CartStore {
  id: number
  name: string
  logo?: string
  products: Array<CartProduct>
}

interface Props {
  store: CartStore
}

export const StoreAccordion = ({ store }: Props) => {
  return (
    <Accordion
      type="multiple"
      defaultValue={[`store-${store.id}`]}
      className="rounded-base border border-stroke overflow-hidden"
    >
      <AccordionItem value={`store-${store.id}`} className="border-none">
        <AccordionTrigger className="hover:no-underline border-none rounded-none bg-gray2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <p className="t1 font-semibold">{store.name}</p>
            <span className="t2 font-medium text-passive2 bg-white border border-stroke rounded-full px-2 py-0.5">
              {store.products.length}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-0">
          <div className="flex flex-col divide-y divide-stroke px-3">
            {store.products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
