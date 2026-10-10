import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Book } from '../types'
import { effectivePrice } from '../utils/format'

export interface CartItem {
  bookId: string
  slug?: string
  title: string
  price: number
  cover: string
  quantity: number
  stock: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (book: Book, quantity?: number) => void
  /** نام مستعار برای سازگاری با BookCard قدیمی */
  add: (book: Book, quantity?: number) => void
  removeItem: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clear: () => void
  count: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('viraaz-cart', [])

  const addItem = useCallback(
    (book: Book, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.bookId === book.id)
        if (existing) {
          const nextQty = Math.min(book.stock, existing.quantity + quantity)
          return prev.map((i) => (i.bookId === book.id ? { ...i, quantity: nextQty } : i))
        }
        return [
          ...prev,
          {
            bookId: book.id,
            slug: (book as Book).slug,
            title: book.title,
            price: effectivePrice(book.price, book.discountPrice),
            cover: book.cover,
            quantity: Math.min(Math.max(1, book.stock > 0 ? quantity : 0) || 1, Math.max(1, book.stock)),
            stock: book.stock,
          },
        ]
      })
    },
    [setItems]
  )

  const removeItem = useCallback(
    (bookId: string) => {
      setItems((prev) => prev.filter((i) => i.bookId !== bookId))
    },
    [setItems]
  )

  const updateQuantity = useCallback(
    (bookId: string, quantity: number) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.bookId !== bookId) return i
          const clamped = Math.max(1, Math.min(i.stock, Math.floor(quantity) || 1))
          return { ...i, quantity: clamped }
        })
      )
    },
    [setItems]
  )

  const clear = useCallback(() => setItems([]), [setItems])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { items, addItem, add: addItem, removeItem, updateQuantity, clear, count, subtotal }
  }, [items, addItem, removeItem, updateQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
