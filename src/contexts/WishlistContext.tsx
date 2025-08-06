import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, WishlistItem } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlistItems([])
      setLoading(false)
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist')
      return
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: productId }])

      if (error) {
        if (error.code === '23505') {
          toast.error('Item is already in your wishlist')
        } else {
          throw error
        }
        return
      }

      toast.success('Added to wishlist')
      fetchWishlist()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      toast.success('Removed from wishlist')
      fetchWishlist()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
} 