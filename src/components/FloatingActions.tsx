'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { 
  ArrowUp, 
  ShoppingCart, 
  Heart, 
  Search,
  MessageCircle,
  Phone
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Expandable Action Menu */}
      <div className={`flex flex-col space-y-2 transition-all duration-300 ${showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {/* Quick Search */}
        <Link href="/search">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
            title="Quick Search"
          >
            <Search className="w-5 h-5" />
          </Button>
        </Link>

        {/* Cart (only for buyers) */}
        {user?.role === 'BUYER' && (
          <Link href="/cart">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>
        )}

        {/* Wishlist (only for buyers) */}
        {user?.role === 'BUYER' && (
          <Link href="/wishlist">
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
        )}

        {/* Support Chat */}
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
          title="Customer Support"
          onClick={() => alert('Customer support chat coming soon!')}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        {/* Call Support */}
        <Button
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
          title="Call Support: +91 123-456-7890"
          onClick={() => window.open('tel:+911234567890')}
        >
          <Phone className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Action Button */}
      <Button
        className="bg-gray-800 hover:bg-gray-900 text-white shadow-xl rounded-full w-14 h-14 p-0 transition-all duration-300"
        onClick={() => setShowActions(!showActions)}
        title="Quick Actions"
      >
        <div className={`transition-transform duration-300 ${showActions ? 'rotate-45' : 'rotate-0'}`}>
          <div className="w-1 h-6 bg-white rounded-full"></div>
          <div className="w-6 h-1 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </Button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl rounded-full w-12 h-12 p-0 animate-bounce"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
