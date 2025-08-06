import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Truck, MapPin, Plus, Check, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { getSupabaseClient, Address } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')
  const [utrNumber, setUtrNumber] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const copyUPIId = () => {
    navigator.clipboard.writeText('parkarsabira9-1@okicici')
    toast.success('UPI ID copied to clipboard!')
  }
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  })

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  const fetchAddresses = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
      // Select default address
      const defaultAddr = data?.find(addr => addr.is_default)
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...newAddress, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setAddresses([...addresses, data])
      setSelectedAddress(data.id)
      setShowAddressForm(false)
      setNewAddress({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      })
      toast.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    if (paymentMethod === 'online' && !utrNumber) {
      toast.error('Please enter UTR number after payment')
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient();
      // Create order
      const orderData = {
        user_id: user?.id,
        total_amount: Math.round(totalPrice * 1.18),
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        utr_number: paymentMethod === 'online' ? utrNumber : null,
        address_id: selectedAddress
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart and redirect
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const totalWithTax = Math.round(totalPrice * 1.18)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-pink-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{address.name}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">
                            {address.address_line1}, {address.address_line2}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        {selectedAddress === address.id && (
                          <Check className="text-pink-600" size={20} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </Button>

              {showAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddAddress}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    />
                    <Input
                      label="Phone Number"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                  <Input
                    label="Address Line 1"
                    required
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    value={newAddress.address_line2}
                    onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                    <Input
                      label="State"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                    <Input
                      label="Pincode"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit">Save Address</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="text-pink-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'online'
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-pink-200 hover:border-pink-300 bg-white'
                  }`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Online Payment</p>
                      <p className="text-gray-600">Pay using UPI/Net Banking</p>
                    </div>
                    {paymentMethod === 'online' && (
                      <Check className="text-pink-600" size={20} />
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-pink-200 hover:border-pink-300 bg-white'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-gray-600">Pay when you receive the order</p>
                    </div>
                    {paymentMethod === 'cod' && (
                      <Check className="text-pink-600" size={20} />
                    )}
                  </div>
                </div>
              </div>

              {paymentMethod === 'online' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowQR(!showQR)}
                    className="mb-4 border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    {showQR ? 'Hide QR Code' : 'Show QR Code for Payment'}
                  </Button>

                  {showQR && (
                    <div className="bg-pink-50 p-6 rounded-lg text-center mb-4 border-2 border-pink-200">
                      <div className="w-64 h-80 mx-auto bg-white rounded-lg p-4 mb-4 shadow-lg border border-pink-200">
                        <div className="text-center">
                          {/* QR Code Image */}
                          <div className="w-48 h-48 mx-auto mb-3">
                            <img 
                              src="/qr-code-sabira-parkar.jpeg" 
                              alt="UPI QR Code"
                              className="w-full h-full object-contain"
                              onLoad={() => console.log('QR code image loaded successfully')}
                              onError={(e) => {
                                console.error('Failed to load QR code image:', e.currentTarget.src);
                                // Fallback if image doesn't load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'block';
                              }}
                            />
                            <div className="w-full h-full bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 text-sm" style={{display: 'none'}}>
                              QR Code Image
                            </div>
                          </div>
                          
                          {/* Payment Details */}
                          <div className="space-y-2">
                            <p className="text-sm text-pink-700 font-medium">Scan to pay ₹{totalWithTax.toLocaleString()}</p>
                            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                              <p className="text-xs text-pink-600 mb-1 font-medium">UPI ID:</p>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-mono text-pink-800">parkarsabira9-1@okicici</p>
                                <button
                                  onClick={copyUPIId}
                                  className="p-1 text-pink-500 hover:text-pink-700 transition-colors"
                                  title="Copy UPI ID"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-pink-600 font-medium">
                        Pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)
                      </p>
                    </div>
                  )}

                  <Input
                    label="UTR Number / Transaction ID"
                    placeholder="Enter transaction reference number"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    required
                  />
                </motion.div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18%)</span>
                    <span>₹{Math.round(totalPrice * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{totalWithTax.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full"
                size="lg"
              >
                {loading ? 'Placing Order...' : `Place Order - ₹${totalWithTax.toLocaleString()}`}
              </Button>

              <div className="flex items-center space-x-2 mt-4 text-sm text-gray-600">
                <Truck size={16} />
                <span>Free delivery in 2-3 business days</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}