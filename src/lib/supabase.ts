import { createClient } from '@supabase/supabase-js'

// Configuration object - will be set at runtime
let SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
}

// Client will be created after configuration is loaded
let supabaseClient: any = null

// Function to initialize Supabase with runtime values
export const initializeSupabase = (url: string, anonKey: string) => {
  SUPABASE_CONFIG.url = url
  SUPABASE_CONFIG.anonKey = anonKey
  // Create client after configuration is set
  supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Initialize with environment variables for development only
if (import.meta.env.DEV) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && anonKey) {
    initializeSupabase(url, anonKey)
  }
} else {
  // In production, fetch from serverless function
  const loadConfig = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-config')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const config = await response.json()
      console.log('Loaded config:', { url: config.supabaseUrl, hasAnonKey: !!config.supabaseAnonKey })
      initializeSupabase(config.supabaseUrl, config.supabaseAnonKey)
    } catch (error) {
      console.error('Failed to load Supabase configuration:', error)
      // No fallback in production - must use serverless function
    }
  }
  loadConfig()
}

// Export client
export const supabase = supabaseClient

// Function to get initialized client
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase not initialized. Please wait for configuration to load.')
  }
  return supabaseClient
}

export interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: 'phone' | 'poster' | 'phone_cover' | 'sticker'
  description: string
  brand?: string
  phone_model?: string
  stock: number
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  products?: Product
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: 'online' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed'
  utr_number?: string
  address_id: string
  created_at: string
  addresses?: Address
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: Product
}