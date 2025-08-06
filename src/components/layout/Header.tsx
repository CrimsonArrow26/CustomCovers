import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Search, Menu, X, Heart, Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { Button } from '../ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const { wishlistItems } = useWishlist()
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b-4 border-gradient-to-r from-pink-500 to-rose-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">C</span>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              CustomCovers
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, posters, covers..."
                className="w-full pl-4 pr-12 py-2 border-2 border-pink-200 rounded-full focus:border-pink-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-pink-500 hover:text-pink-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-pink-600 hover:text-pink-800 transition-colors"
                  >
                    <ShoppingCart size={24} />
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                <Link to="/wishlist">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-pink-600 hover:text-pink-800 transition-colors relative"
                  >
                    <Heart size={24} />
                    {wishlistItems.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {wishlistItems.length}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-pink-600 hover:text-pink-800 transition-colors relative"
                    >
                      <Bell size={24} />
                      <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
                    </motion.div>
                  </Link>
                )}

                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-pink-600 hover:text-pink-800 transition-colors"
                  >
                    <User size={24} />
                  </motion.button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-pink-50 transition-colors">
                        My Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-pink-50 transition-colors">
                        My Orders
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-pink-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-pink-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-pink-200 py-4"
            >
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-2 border-2 border-pink-200 rounded-full focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-pink-500"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>
              <div className="flex flex-col space-y-2">
                <Link to="/stickers" className="text-gray-800 hover:text-pink-600 py-2">Stickers</Link>
                <Link to="/posters" className="text-gray-800 hover:text-pink-600 py-2">Posters</Link>
                <Link to="/covers" className="text-gray-800 hover:text-pink-600 py-2">Phone Covers</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}