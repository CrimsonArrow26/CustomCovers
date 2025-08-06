import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, TrendingUp, Shield, Truck } from 'lucide-react'
import { supabase, Product } from '../lib/supabase'
import { ProductGrid } from '../components/products/ProductGrid'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(8)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    {
      name: 'Stickers',
      image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
      link: '/stickers',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Posters',
      image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg',
      link: '/posters',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Phone Covers',
      image: 'https://images.pexels.com/photos/163129/phone-mobile-smartphone-cellular-163129.jpeg',
      link: '/covers',
      gradient: 'from-rose-500 to-orange-500'
    }
  ]

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Shopping',
      description: 'Your transactions are protected with bank-level security'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Quick delivery to your doorstep within 2-3 business days'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Quality Products',
      description: 'Carefully curated products with quality guarantee'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Best Prices',
      description: 'Competitive prices with regular discounts and offers'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-pink-200 to-rose-100">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-gray-800"
            >
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Welcome to
                <span className="block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  CustomCovers
                </span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Discover the latest stickers, trendy posters, and stylish phone covers. 
                Your one-stop destination for all things beautiful and custom!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/stickers">
                  <Button size="lg" className="bg-pink-500 text-white hover:bg-pink-600 shadow-xl">
                    Shop Now
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/deals">
                  <Button variant="outline" size="lg" className="border-pink-500 text-pink-600 hover:bg-pink-50">
                    View Deals
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/147411/italy-mobile-phone-phone-card-147411.jpeg"
                  alt="Featured Products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Star className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">4.9/5 Stars</p>
                    <p className="text-sm text-gray-600">10,000+ Reviews</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our carefully curated collection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={category.link}>
                  <Card className="group relative overflow-hidden h-64">
                    <div className="absolute inset-0">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-80`}></div>
                    </div>
                    <div className="relative h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-3xl font-bold mb-2">{category.name}</h3>
                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>Shop Now</span>
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose CustomCovers?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to providing the best shopping experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center p-8 h-full">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Discover our latest and most popular items
            </p>
          </motion.div>

          <ProductGrid products={featuredProducts} loading={loading} />

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" className="shadow-lg">
                View All Products
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}