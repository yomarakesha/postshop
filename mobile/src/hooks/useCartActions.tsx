import { cartApi } from '@/api/cartApi'
import { useCartStore } from '@/store/useCartStore'
import { useUserStore } from '@/store/useUserStore'
import ErrorAlert from '@/utils/errorAlert'
import { TFunction } from 'i18next'

const useCartActions = ({ t }: { t: TFunction }) => {
  const isGuest = useUserStore((s) => s.isGuest)
  const addToCartMutation = cartApi.useAdd()
  const updateQuantityMutation = cartApi.useUpdateQuantity()
  const removeItemMutation = cartApi.useRemoveItem()

  const addItem = useCartStore((s) => s.addItem)
  const updateItem = useCartStore((s) => s.updateItem)

  const add = async (id: number) => {
    if (isGuest) {
      addItem(id)
    } else {
      try {
        await addToCartMutation.mutateAsync({
          product_id: Number(id),
          quantity: 1,
        })
      } catch (error: any) {
        ErrorAlert(t, error)
      }
    }
  }

  const update = async (id: number, quantity: number) => {
    if (isGuest) {
      updateItem(id, quantity)
    } else {
      if (quantity > 0) {
        await updateQuantityMutation.mutateAsync({
          productId: Number(id),
          quantity,
        })
      } else {
        await removeItemMutation.mutateAsync({ productId: id })
      }
    }
  }

  return {
    update,
    add,
  }
}

export default useCartActions
