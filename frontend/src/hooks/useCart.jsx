import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from './useAuth'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0, items_count: 0 })
  const [loading, setLoading] = useState(false)

  const loadCart = async () => {
    if (!user) { setCart({ items: [], total: 0, items_count: 0 }); return }
    setLoading(true)
    try { setCart(await api.getCart()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCart() }, [user])

  const addToCart = async (productId, quantity = 1) => {
    const result = await api.addToCart({ product_id: productId, quantity })
    setCart(result)
    return result
  }

  const updateItem = async (itemId, quantity) => {
    const result = await api.updateCartItem(itemId, { quantity })
    setCart(result)
  }

  const removeItem = async (itemId) => {
    const result = await api.removeCartItem(itemId)
    setCart(result)
  }

  const clearCart = async () => {
    const result = await api.clearCart()
    setCart(result)
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, reload: loadCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
