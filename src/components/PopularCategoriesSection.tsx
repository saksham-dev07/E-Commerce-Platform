'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Smartphone, 
  Shirt, 
  Home, 
  BookOpen, 
  Gamepad2, 
  Watch,
  Car,
  Heart,
  TrendingUp,
  ChevronRight,
  Dumbbell,
  Wrench,
  Briefcase,
  Package,
  ChevronLeft
} from 'lucide-react'

const categories = [
  {
    name: 'Electronics',
    icon: Smartphone,
    href: '/search?category=Electronics',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    description: 'Latest gadgets & tech'
  },
  {
    name: 'Clothing',
    icon: Shirt,
    href: '/search?category=Clothing',
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    description: 'Trendy clothing & fashion'
  },
  {
    name: 'Home & Garden',
    icon: Home,
    href: '/search?category=Home%20%26%20Garden',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    description: 'Transform your living space'
  },
  {
    name: 'Sports & Outdoors',
    icon: Dumbbell,
    href: '/search?category=Sports%20%26%20Outdoors',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    description: 'Fitness & outdoor gear'
  },
  {
    name: 'Books',
    icon: BookOpen,
    href: '/search?category=Books',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    description: 'Expand your knowledge'
  },
  {
    name: 'Toys & Games',
    icon: Gamepad2,
    href: '/search?category=Toys%20%26%20Games',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    description: 'Games & entertainment'
  },
  {
    name: 'Health & Beauty',
    icon: Heart,
    href: '/search?category=Health%20%26%20Beauty',
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    description: 'Wellness & beauty products'
  },
  {
    name: 'Tools & Hardware',
    icon: Wrench,
    href: '/search?category=Tools%20%26%20Hardware',
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    description: 'Tools & hardware supplies'
  },
  {
    name: 'Automotive',
    icon: Car,
    href: '/search?category=Automotive',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    description: 'Car accessories & parts'
  },
  {
    name: 'Office Supplies',
    icon: Briefcase,
    href: '/search?category=Office%20Supplies',
    color: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    description: 'Office & business supplies'
  },
  {
    name: 'Other',
    icon: Package,
    href: '/search?category=Other',
    color: 'bg-slate-500',
    hoverColor: 'hover:bg-slate-600',
    description: 'Miscellaneous items'
  }
]

interface CategoryStats {
  totalProducts: number
  totalCategories: number
}

export function PopularCategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({ totalProducts: 0, totalCategories: 0 })
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    fetchCategoryStats()
    // Check initial scroll state
    setTimeout(checkScrollButtons, 100)
  }, [])

  const checkScrollButtons = () => {
    const container = document.getElementById('categories-scroll-container')
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('categories-scroll-container')
    if (container) {
      const cardWidth = 192 + 24 // card width (w-48 = 192px) + gap (gap-6 = 24px)
      const containerWidth = container.clientWidth - 96 // subtract padding (px-12 = 48px on each side)
      const currentScroll = container.scrollLeft
      
      // Calculate how many full cards can fit in the visible area
      const cardsInView = Math.floor(containerWidth / cardWidth)
      const scrollAmount = cardsInView * cardWidth
      
      let newPosition
      if (direction === 'left') {
        newPosition = Math.max(0, currentScroll - scrollAmount)
      } else {
        newPosition = currentScroll + scrollAmount
      }
      
      // Ensure we align to card boundaries
      const cardIndex = Math.round(newPosition / cardWidth)
      const alignedPosition = cardIndex * cardWidth
      
      container.scrollTo({
        left: alignedPosition,
        behavior: 'smooth'
      })
      setScrollPosition(alignedPosition)
      
      // Update button states after scroll
      setTimeout(checkScrollButtons, 400)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const cardWidth = 192 + 24 // card width + gap
    const currentScroll = container.scrollLeft
    
    // Update button states
    checkScrollButtons()
    
    // Snap to nearest card when scrolling stops
    clearTimeout((window as any).scrollTimeout)
    ;(window as any).scrollTimeout = setTimeout(() => {
      // Calculate which card should be at the start of the visible area
      const cardIndex = Math.round(currentScroll / cardWidth)
      const snapPosition = cardIndex * cardWidth
      
      // Only snap if we're not already aligned
      if (Math.abs(currentScroll - snapPosition) > 5) {
        container.scrollTo({
          left: snapPosition,
          behavior: 'smooth'
        })
      }
      
      setScrollPosition(snapPosition)
      setTimeout(checkScrollButtons, 100)
    }, 100) // Reduced timeout for faster snapping
    
    setScrollPosition(currentScroll)
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        const products = data.products || []
        const uniqueCategories = [...new Set(products.map((p: any) => p.category))]
        
        setCategoryStats({
          totalProducts: products.length,
          totalCategories: uniqueCategories.length
        })
      }
    } catch (error) {
      console.error('Failed to fetch category stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of products across different categories. 
            Find exactly what you're looking for with ease.
          </p>
        </div>

        <div className="relative mb-8">
          {/* Navigation arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scrollContainer('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:shadow-xl border border-gray-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={() => scrollContainer('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:shadow-xl border border-gray-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          )}
          
          {/* Horizontal scrolling container */}
          <div 
            id="categories-scroll-container"
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12 scroll-smooth scroll-snap-x"
            onScroll={handleScroll}
          >
            {categories.map((category, index) => (
              <Link key={category.name} href={category.href}>
                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md overflow-hidden flex-shrink-0 w-48 hover:-translate-y-1 scroll-snap-start"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <CardContent className="p-6 text-center relative">
                    <div className={`w-16 h-16 ${category.color} ${category.hoverColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                      <category.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                      {category.description}
                    </p>
                    
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <ChevronRight className="w-5 h-5 text-blue-600 mx-auto animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Scroll indicators with animation */}
          <div className="flex justify-center mt-4">
            <div className="text-sm text-gray-500 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm animate-bounce">
              ← Scroll to explore all {categories.length} categories →
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '...' : categoryStats.totalProducts.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Total Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 font-medium">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? '...' : categoryStats.totalCategories}
              </div>
              <div className="text-gray-600 font-medium">Active Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">New Arrivals</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/search">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Browse All Categories
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
