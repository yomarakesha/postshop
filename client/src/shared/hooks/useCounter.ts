import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '#/app/localization'
import { getErrorMessage } from '#/shared/lib/apiError'
import { useCartStore } from '#/shared/stores/cartStore'
import { useProfileStore } from '#/shared/stores/profileStore'
import {
  useAddToCartCartPost,
  useGetCartCartGet,
  useRemoveFromCartCartProductIdDelete,
  useUpdateCartItemCartProductIdPut,
} from '#/shared/openapi/queries'
import { useGetCartCartGetKey } from '#/shared/openapi/queries/common'

export const useCounter = (productId: number) => {
  const profile = useProfileStore((s) => s.profile)
  const queryClient = useQueryClient()

  const localQuantity = useCartStore(
    (s) => s.items.find((i) => i.product_id === productId)?.quantity ?? 0,
  )
  const addItemLocal = useCartStore((s) => s.addItem)
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity)

  const { data: cart } = useGetCartCartGet({}, undefined, { enabled: !!profile })
  // Сервер отказывает, когда остатка не хватает. Без сообщения нажатие
  // выглядело бы как «ничего не произошло».
  const showError = (error: unknown) => {
    const message = getErrorMessage(error)
    // Сообщение сервера о нехватке остатка — служебное, по-английски и с
    // числами. Покупателю нужна одна понятная фраза.
    toast.error(message.includes('Insufficient stock') ? i18n.t('cart.notEnough') : message)
  }

  // Обработчик ошибки задаётся на уровне мутации, а не отдельного вызова:
  // общий обработчик в react-query молчит только в этом случае, иначе об
  // одной ошибке приходило два сообщения.
  const addToCart = useAddToCartCartPost(undefined, { onError: showError })
  const updateCartItem = useUpdateCartItemCartProductIdPut(undefined, { onError: showError })
  const removeFromCart = useRemoveFromCartCartProductIdDelete()

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: [useGetCartCartGetKey] })

  const serverQuantity =
    cart?.groups.flatMap((g) => g.items).find((i) => i.product.id === productId)?.quantity ?? 0

  const quantity = profile ? serverQuantity : localQuantity

  const add = () => {
    if (profile) {
      addToCart.mutate(
        { body: { product_id: productId, quantity: 1 } },
        { onSuccess: invalidateCart },
      )
    } else {
      addItemLocal(productId)
    }
  }

  const update = (newQuantity: number) => {
    if (profile) {
      if (newQuantity <= 0) {
        removeFromCart.mutate({ path: { product_id: productId } }, { onSuccess: invalidateCart })
      } else {
        updateCartItem.mutate(
          { path: { product_id: productId }, body: { quantity: newQuantity } },
          { onSuccess: invalidateCart },
        )
      }
    } else {
      updateQuantityLocal(productId, newQuantity)
    }
  }

  const increment = () => update(quantity + 1)
  const decrement = () => update(quantity - 1)

  return { quantity, add, update, increment, decrement }
}
