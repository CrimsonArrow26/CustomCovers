import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Calendar, MapPin, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Order } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          addresses(*),
          order_items(*, products(*))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order history and status</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <Package size={48} className="text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <a href="/products" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
              Start Shopping
            </a>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                        <Package className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          <Calendar size={14} className="inline mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold text-gray-800 mt-1">
                        ₹{order.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <MapPin size={16} className="mr-2" />
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{order.addresses?.name}</p>
                        <p>{order.addresses?.phone}</p>
                        <p>{order.addresses?.address_line1}</p>
                        {order.addresses?.address_line2 && <p>{order.addresses.address_line2}</p>}
                        <p>{order.addresses?.city}, {order.addresses?.state} - {order.addresses?.pincode}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <CreditCard size={16} className="mr-2" />
                        Payment Details
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Method:</span> {order.payment_method.toUpperCase()}</p>
                        <p><span className="font-medium">Status:</span> {order.payment_status}</p>
                        {order.utr_number && (
                          <p><span className="font-medium">UTR:</span> {order.utr_number}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.products?.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 