import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product } from '../../lib/supabase'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'phone': return 'primary'
      case 'poster': return 'secondary'
      case 'phone_cover': return 'success'
      default: return 'primary'
    }
  }

  return (
    <Card className={`group overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
      <Link to={`/product/${product.id}`} className={viewMode === 'list' ? 'flex w-full' : ''}>
        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
          <div className={`${viewMode === 'list' ? 'w-full h-48' : 'aspect-square'} overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50`}>
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute top-2 left-2">
            <Badge variant={getCategoryColor(product.category)}>
              {product.category.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isInWishlist(product.id) 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-pink-500'
            }`}
          >
            <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </motion.button>

          {product.stock < 10 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="warning">
                Only {product.stock} left!
              </Badge>
            </div>
          )}
        </div>

        <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{product.brand}</p>
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.5</span>
              </div>
            </div>

            <h3 className={`font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors ${viewMode === 'list' ? 'text-xl' : 'line-clamp-2'}`}>
              {product.name}
            </h3>

            <p className={`text-sm text-gray-600 mb-3 ${viewMode === 'list' ? '' : 'line-clamp-2'}`}>
              {product.description}
            </p>
          </div>

          <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-4' : ''}`}>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-pink-600">
                ₹{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 line-through">
                ₹{(product.price * 1.2).toLocaleString()}
              </p>
            </div>

            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex items-center space-x-1"
            >
              <ShoppingCart size={16} />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}