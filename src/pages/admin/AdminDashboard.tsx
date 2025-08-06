import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Package, Users, TrendingUp, Eye, Check, X, Upload, Trash2, Plus, ShoppingCart } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import toast from 'react-hot-toast'

export function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [catalogCategory, setCatalogCategory] = useState<'phone_cover' | 'poster' | 'sticker'>('phone_cover')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [productImage, setProductImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])

  useEffect(() => {
    // Check if user is admin or has admin email
    const isUserAdmin = isAdmin || user?.email === 'Parkarsabira9@gmail.com'
    
    console.log('AdminDashboard useEffect:', {
      isUserAdmin,
      user: user?.email,
      isAdmin
    })
    
    if (isUserAdmin) {
      console.log('Fetching admin data...')
      fetchOrders()
      fetchStats()
      fetchCatalogProducts()
      
      // Subscribe to new orders
      const ordersSubscription = supabase
        .channel('orders')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          toast.success('New order received!')
          fetchOrders()
          fetchStats()
        })
        .subscribe()

      return () => {
        ordersSubscription.unsubscribe()
      }
    } else {
      console.log('User is not admin, not fetching data')
    }
  }, [isAdmin, user?.email, catalogCategory])

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#products') {
      // Scroll to products section
      const productsSection = document.getElementById('catalog-management')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (hash === '#orders') {
      // Scroll to orders section
      const ordersSection = document.getElementById('orders-section')
      if (ordersSection) {
        ordersSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  const fetchOrders = async () => {
    console.log('Fetching orders...')
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          addresses(*),
          order_items(*, products(*))
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Orders fetched:', data?.length || 0)
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    console.log('Fetching stats...')
    try {
      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Get pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'confirmed')

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const newStats = {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        totalUsers: totalUsers || 0
      }
      
      console.log('Stats fetched:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCatalogProducts = async () => {
    console.log('Fetching products for category:', catalogCategory)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', catalogCategory)
      .order('created_at', { ascending: false })
    
    console.log('Products fetch result:', { data, error })
    if (!error) {
      setCatalogProducts(data || [])
      console.log('Set catalog products:', data || [])
    } else {
      console.error('Error fetching products:', error)
    }
  }

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0])
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    let imageUrl = ''
    try {
      if (productImage) {
        try {
          // Upload to Supabase Storage using admin client
          const fileExt = productImage.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
          const { data, error } = await supabaseAdmin.storage.from('product-images').upload(fileName, productImage)
          if (error) {
            console.error('Storage upload error:', error)
            // Use a placeholder image if storage fails
            imageUrl = 'https://via.placeholder.com/300x300?text=Product+Image'
            toast.error('Storage bucket not configured. Using placeholder image. Please set up Supabase Storage.')
          } else {
            // Get public URL
            const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(fileName)
            imageUrl = publicUrlData.publicUrl
          }
        } catch (storageError) {
          console.error('Storage error:', storageError)
          // Use a placeholder image if storage fails
          imageUrl = 'https://via.placeholder.com/300x300?text=Product+Image'
          toast.error('Storage not available. Using placeholder image.')
        }
      }
      
      // Insert into products table
      const { error: insertError } = await supabase.from('products').insert([
        {
          name: productName,
          price: parseFloat(productPrice),
          image_url: imageUrl,
          category: catalogCategory,
          description: productDesc,
          stock: 100,
        },
      ])
      if (insertError) throw insertError
      toast.success('Product added!')
      setProductName('')
      setProductPrice('')
      setProductDesc('')
      setProductImage(null)
      fetchCatalogProducts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product')
    } finally {
      setUploading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      fetchOrders()
      fetchStats()
      toast.success(`Order ${status} successfully`)
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success(`Product "${productName}" deleted successfully`)
      fetchCatalogProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'primary'
      case 'shipped': return 'secondary'
      case 'delivered': return 'success'
      case 'cancelled': return 'error'
      default: return 'primary'
    }
  }

  // Check if user is admin or has admin email
  const isUserAdmin = isAdmin || user?.email === 'Parkarsabira9@gmail.com'
  
  console.log('AdminDashboard Debug:', {
    user: user?.email,
    role: user?.role,
    isAdmin,
    isUserAdmin
  })
  
  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current user: {user?.email}</p>
          <p className="text-sm text-gray-500">Role: {user?.role}</p>
          <p className="text-sm text-gray-500">isAdmin: {isAdmin ? 'true' : 'false'}</p>
          <p className="text-sm text-gray-500">isUserAdmin: {isUserAdmin ? 'true' : 'false'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and monitor your business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Bell className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
                  <p className="text-gray-600">Pending Orders</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-600">Total Revenue</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                  <p className="text-gray-600">Total Users</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Catalog Management Section */}
        <div id="catalog-management" className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Package className="text-pink-600" size={24} />
            <span>Catalog Management</span>
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={catalogCategory === 'phone_cover' ? 'primary' : 'outline'} 
              onClick={() => setCatalogCategory('phone_cover')}
              className="flex items-center space-x-2"
            >
              <Package size={16} />
              <span>Phone Covers</span>
            </Button>
            <Button 
              variant={catalogCategory === 'poster' ? 'primary' : 'outline'} 
              onClick={() => setCatalogCategory('poster')}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Posters</span>
            </Button>
            <Button 
              variant={catalogCategory === 'sticker' ? 'primary' : 'outline'} 
              onClick={() => setCatalogCategory('sticker')}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Stickers</span>
            </Button>
          </div>
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Plus className="text-pink-600" size={20} />
              <span>Add New Product</span>
            </h3>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={productName} 
                  onChange={e => setProductName(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" 
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  value={productPrice} 
                  onChange={e => setProductPrice(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" 
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  value={productDesc} 
                  onChange={e => setProductDesc(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" 
                  placeholder="Product description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input 
                  type="file" 
                  onChange={handleProductImageChange} 
                  accept="image/*" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" 
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button 
                  type="submit" 
                  disabled={uploading} 
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Add Product</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
          {/* Product List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogProducts.map(product => (
              <Card key={product.id} className="p-4 flex flex-col items-center relative group">
                {/* Delete Button */}
                <button
                  onClick={() => deleteProduct(product.id, product.name)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  title="Delete product"
                >
                  <Trash2 size={16} />
                </button>
                
                <img src={product.image_url} alt={product.name} className="w-32 h-32 object-cover rounded mb-2" />
                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                <p className="text-pink-600 font-semibold mb-1">₹{product.price}</p>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <span className="inline-block bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded">{product.category.replace('_', ' ')}</span>
              </Card>
            ))}
            {catalogProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                <p>No products found for category: {catalogCategory}</p>
                <p className="text-sm text-gray-400 mt-2">Total products in database: {catalogProducts.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <Card id="orders-section" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <ShoppingCart className="text-pink-600" size={24} />
              <span>Recent Orders</span>
            </h2>
            <div className="flex items-center space-x-2 bg-pink-50 px-3 py-1 rounded-full">
              <Bell className="text-pink-600" size={16} />
              <span className="text-sm text-gray-600 font-medium">{stats.pendingOrders} pending</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{order.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{order.payment_method.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Customer Address:</p>
                      <p className="text-sm text-gray-600">
                        {order.addresses?.name}<br />
                        {order.addresses?.address_line1}, {order.addresses?.city}<br />
                        {order.addresses?.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                      <div className="text-sm text-gray-600">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx}>
                            {item.products?.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {order.payment_method === 'online' && order.utr_number && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">UTR Number:</p>
                      <p className="text-sm text-gray-600">{order.utr_number}</p>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check size={16} />
                        <span>Confirm Order</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <X size={16} />
                        <span>Cancel Order</span>
                      </Button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="flex items-center space-x-1"
                      >
                        <Package size={16} />
                        <span>Mark as Shipped</span>
                      </Button>
                    </div>
                  )}

                  {order.status === 'shipped' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check size={16} />
                        <span>Mark as Delivered</span>
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}