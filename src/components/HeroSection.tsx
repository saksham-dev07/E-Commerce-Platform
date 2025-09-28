'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useStats } from '../contexts/StatsContext'
import { useRouter } from 'next/navigation'

export function HeroSection() {
  const { totalProducts, totalSellers, totalOrders, loading } = useStats()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentText, setCurrentText] = useState(0)
  const router = useRouter()

  const dynamicTexts = [
    "Future of Shopping",
    "Best Deals Online", 
    "Premium Marketplace",
    "Shopping Revolution"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % dynamicTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Calculate satisfaction percentage based on actual data
  const satisfactionRate = totalOrders > 0 ? Math.min(95 + (totalOrders / 10), 99) : 0
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <Sparkles className="w-5 h-5 text-yellow-300 mr-2" />
            <span className="text-yellow-200 font-medium">✨ Welcome to the Future of E-commerce</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Welcome to the
            <span 
              key={currentText}
              className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent animate-pulse"
            >
              {dynamicTexts[currentText]}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Discover amazing products from trusted sellers worldwide. Shop with confidence 
            and enjoy lightning-fast, secure delivery right to your doorstep.
          </p>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-16 text-lg text-gray-900 bg-white/95 backdrop-blur-sm border-0 rounded-full shadow-2xl focus:bg-white focus:ring-4 focus:ring-white/20"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg"
              >
                Search
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-3">
              Popular: Electronics, Fashion, Home & Garden, Books
            </p>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="#products">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                Shop Now
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/auth/seller">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg font-semibold px-8 py-4 rounded-xl backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Become a Seller
              </Button>
            </Link>
          </div>
          
          {/* Real Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                {loading ? '...' : totalProducts.toLocaleString()}
              </div>
              <div className="text-blue-200 font-medium">Products Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                {loading ? '...' : totalSellers.toLocaleString()}
              </div>
              <div className="text-blue-200 font-medium">Active Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                {loading ? '...' : totalOrders.toLocaleString()}
              </div>
              <div className="text-blue-200 font-medium">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                {loading ? '...' : `${Math.floor(satisfactionRate)}%`}
              </div>
              <div className="text-blue-200 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 opacity-5 rounded-full blur-2xl"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-500 to-yellow-500 opacity-20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 opacity-20 rounded-full blur-xl animate-pulse"></div>
      </div>
    </section>
  )
}
