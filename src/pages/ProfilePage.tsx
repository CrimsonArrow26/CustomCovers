import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield, Edit, Lock, Package, MapPin, Settings, BarChart3, ShoppingCart, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  }
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return null
  }

  const handleEditProfile = () => {
    toast.success('Edit profile feature coming soon!')
    setIsEditing(true)
    // TODO: Implement edit profile functionality
  }

  const handleChangePassword = () => {
    navigate('/change-password')
  }

  const handleManageProducts = () => {
    navigate('/admin#products')
    // Navigate to admin dashboard with products section focus
  }

  const handleViewOrders = () => {
    navigate('/admin#orders')
    // Navigate to admin dashboard with orders section focus
  }

  const handleAddresses = () => {
    toast.success('Address management feature coming soon!')
    // TODO: Implement address management
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center"
                >
                  <User className="text-white" size={32} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user.full_name}</h2>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <Shield className="text-pink-500" size={16} />
                                         <span>{(user.role === 'admin' || user.email === 'Parkarsabira9@gmail.com') ? 'Administrator' : 'Customer'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="text-pink-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-pink-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-800 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="text-pink-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                                         <p className="text-gray-800 font-medium capitalize">
                       {(user.role === 'admin' || user.email === 'Parkarsabira9@gmail.com') ? 'admin' : user.role}
                     </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Settings className="text-pink-600" size={20} />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleEditProfile}
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleChangePassword}
                >
                  <Lock size={16} />
                  <span>Change Password</span>
                </Button>
                <Link to="/orders" className="block">
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <ShoppingCart size={16} />
                    <span>View Orders</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleAddresses}
                >
                  <MapPin size={16} />
                  <span>Addresses</span>
                </Button>

                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleSignOut}
                >
                  <Lock size={16} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </Card>

            {(user.role === 'admin' || user.email === 'Parkarsabira9@gmail.com') && (
              <Card className="p-6 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <BarChart3 className="text-pink-600" size={20} />
                  <span>Admin Tools</span>
                </h3>
                <div className="space-y-3">
                  <Link to="/admin" className="block">
                    <Button variant="secondary" className="w-full flex items-center justify-center space-x-2">
                      <BarChart3 size={16} />
                      <span>Admin Dashboard</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleManageProducts}
                  >
                    <Package size={16} />
                    <span>Manage Products</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleViewOrders}
                  >
                    <ShoppingCart size={16} />
                    <span>View Orders</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 