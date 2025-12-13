import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === product.productId,
          )

          if (exists) {
            return {
              items: state.items.map((i) =>
                i.productId === product.productId
                  ? {
                      ...i,
                      qty: Math.min(
                        i.qty + qty,
                        product.countInStock ?? Infinity,
                      ),
                    }
                  : i,
              ),
            }
          }

          const newItem: CartItem = {
            ...product,
            qty: Math.min(qty, product.countInStock ?? qty),
          }

          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== id),
        }))
      },

      updateQty: (id, qty) => {
        if (qty <= 0) return
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === id
              ? { ...i, qty: Math.min(qty, i.countInStock ?? qty) }
              : i,
          ),
        }))
      },

      clearCart: () => set(() => ({ items: [] })),

      getTotalItems: () => {
        return get().items.reduce((acc, i) => acc + i.qty, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((acc, i) => acc + i.qty * i.price, 0)
      },
    }),
    {
      name: 'hamperland-cart',
    },
  ),
)

export default useCartStore
