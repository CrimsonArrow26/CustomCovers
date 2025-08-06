import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 text-gray-800 border-t border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-pink-600 font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold">CustomCovers</span>
            </div>
            <p className="text-gray-600">
              Your one-stop destination for stickers, posters, and accessories with style.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-pink-500">
                <Heart size={16} />
                <span className="text-sm">Made with love</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/stickers" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Stickers
              </Link>
              <Link to="/posters" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Posters
              </Link>
              <Link to="/covers" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Phone Covers
              </Link>
              <Link to="/deals" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Special Deals
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link to="/help" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Help Center
              </Link>
              <Link to="/returns" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Returns & Refunds
              </Link>
              <Link to="/shipping" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Shipping Info
              </Link>
              <Link to="/contact" className="block text-gray-600 hover:text-pink-600 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone size={16} />
                <span>+91 820 870 5543</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail size={16} />
                <span>Parkarsabira9@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin size={16} />
                <span>123 Pink Street, Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2025 CustomCovers. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  )
}