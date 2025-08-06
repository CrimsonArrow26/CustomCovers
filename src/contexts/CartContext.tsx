import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product, getSupabaseClient } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserCart()
    } else {
      // Fallback to localStorage for non-authenticated users
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
      setLoading(false)
    }
  }, [user])

  const fetchUserCart = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const cartItems = data?.map(item => ({
        product: item.products,
        quantity: item.quantity
      })) || []

      setItems(cartItems)
    } catch (error) {
      console.error('Error fetching cart:', error)
      // Fallback to localStorage
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } finally {
      setLoading(false)
    }
  }

  const saveCartToDatabase = async (newItems: CartItem[]) => {
    if (!user) return

    try {
      // Clear existing cart items
      const supabase = getSupabaseClient();
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)

      // Insert new cart items
      if (newItems.length > 0) {
        const cartData = newItems.map(item => ({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity
        }))

        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('cart')
          .insert(cartData)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error saving cart to database:', error)
    }
  }

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      let newItems
      
      if (existingItem) {
        toast.success('Updated quantity in cart')
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        toast.success('Added to cart')
        newItems = [...prev, { product, quantity }]
      }

      // Save to database if user is authenticated
      if (user) {
        saveCartToDatabase(newItems)
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('cart', JSON.stringify(newItems))
      }

      return newItems
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId)
      
      // Save to database if user is authenticated
      if (user) {
        saveCartToDatabase(newItems)
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('cart', JSON.stringify(newItems))
      }
      
      return newItems
    })
    toast.success('Removed from cart')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      
      // Save to database if user is authenticated
      if (user) {
        saveCartToDatabase(newItems)
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('cart', JSON.stringify(newItems))
      }
      
      return newItems
    })
  }

  const clearCart = async () => {
    setItems([])
    
    // Clear from database if user is authenticated
    if (user) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
        console.log('Cart cleared from database')
      } catch (error) {
        console.error('Error clearing cart from database:', error)
      }
    } else {
      // Clear from localStorage for non-authenticated users
      localStorage.removeItem('cart')
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    loading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}