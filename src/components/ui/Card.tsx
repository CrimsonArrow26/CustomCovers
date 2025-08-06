import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-lg ${
        hover ? 'hover:shadow-xl' : ''
      } transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}