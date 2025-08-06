import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Filter, Grid, List } from 'lucide-react'
import { getSupabaseClient, Product } from '../lib/supabase'
import { ProductGrid } from '../components/products/ProductGrid'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useNavigate } from 'react-router-dom'

interface CategoryPageProps {
  category: string
  title: string
  description: string
}

export function CategoryPage({ category, title, description }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [category, sortBy, priceRange[0], priceRange[1]])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient();
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1])

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = () => {
    switch (category) {
      case 'sticker':
        return '🎯'
      case 'poster':
        return '🖼️'
      case 'cover':
        return '📱'
      default:
        return '🛍️'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-4xl">{getCategoryIcon()}</span>
              <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
            <Badge variant="secondary" className="mt-4">
              {products.length} products available
            </Badge>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-pink-600" />
                  <span className="font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-pink-200 rounded-lg px-3 py-1 focus:border-pink-500 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">Price Range:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-20 border border-pink-200 rounded-lg px-2 py-1 focus:border-pink-500 focus:outline-none"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20 border border-pink-200 rounded-lg px-2 py-1 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">View:</span>
                <div className="flex border border-pink-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:text-pink-600'}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:text-pink-600'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any {category} products matching your criteria.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </Card>
          ) : (
            <ProductGrid products={products} viewMode={viewMode} />
          )}
        </motion.div>
      </div>
    </div>
  )
} 