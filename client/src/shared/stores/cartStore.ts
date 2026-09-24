import { create } from 'zustand'
import { LocalStorage } from '#/shared/lib/LocalStorage'
import { addToCartCartPost } from '#/shared/openapi/requests'

export interface CartItem {
  product_id: number
  quantity: number
}

interface CartState {
  items: Array<CartItem>
  addItem: (product_id: number, quantity?: number) => void
  removeItem: (product_id: number) => void
  updateQuantity: (product_id: number, quantity: number) => void
  clearCart: () => void
  syncToBackend: () => Promise<void>
}

const loadCart = (): Array<CartItem> => {
  const raw = LocalStorage.get('cart')
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const saveCart = (items: Array<CartItem>) => {
  LocalStorage.set('cart', JSON.stringify(items))
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),

  addItem: (product_id, quantity = 1) => {
    const items = get().items
    const existing = items.find((i) => i.product_id === product_id)

    let updated: Array<CartItem>
    if (existing) {
      updated = items.map((i) =>
        i.product_id === product_id ? { ...i, quantity: i.quantity + quantity } : i,
      )
    } else {
      updated = [...items, { product_id, quantity }]
    }

    saveCart(updated)
    set({ items: updated })
  },

  removeItem: (product_id) => {
    const updated = get().items.filter((i) => i.product_id !== product_id)
    saveCart(updated)
    set({ items: updated })
  },

  updateQuantity: (product_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(product_id)
      return
    }
    const updated = get().items.map((i) => (i.product_id === product_id ? { ...i, quantity } : i))
    saveCart(updated)
    set({ items: updated })
  },

  clearCart: () => {
    LocalStorage.delete('cart')
    set({ items: [] })
  },

  syncToBackend: async () => {
    const items = get().items
    if (items.length === 0) return

    // Клиент теперь бросает на ошибочных ответах, а перенос корзины идёт при
    // входе: если хотя бы одна позиция не легла (товар сняли с продажи, магазин
    // закрылся), локальную корзину не стираем — иначе покупатель потерял бы её
    // целиком из-за одного недоступного товара.
    const results = await Promise.allSettled(
      items.map((item) =>
        addToCartCartPost({
          body: { product_id: item.product_id, quantity: item.quantity },
        }),
      ),
    )

    if (results.some((result) => result.status === 'rejected')) return

    LocalStorage.delete('cart')
    set({ items: [] })
  },
}))
