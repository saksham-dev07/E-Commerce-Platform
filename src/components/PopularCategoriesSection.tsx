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
  ChevronRight
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
    name: 'Fashion',
    icon: Shirt,
    href: '/search?category=Fashion',
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    description: 'Trendy clothing & accessories'
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
    name: 'Books & Media',
    icon: BookOpen,
    href: '/search?category=Books%20%26%20Media',
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
    name: 'Jewelry & Accessories',
    icon: Watch,
    href: '/search?category=Jewelry%20%26%20Accessories',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    description: 'Luxury & accessories'
  },
  {
    name: 'Automotive',
    icon: Car,
    href: '/search?category=Automotive',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    description: 'Car accessories & parts'
  },
  {
    name: 'Health & Beauty',
    icon: Heart,
    href: '/search?category=Health%20%26%20Beauty',
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    description: 'Wellness & beauty products'
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

  useEffect(() => {
    fetchCategoryStats()
  }, [])

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md overflow-hidden"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CardContent className="p-6 text-center relative">
                  <div className={`w-16 h-16 ${category.color} ${category.hoverColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {category.description}
                  </p>
                  
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-5 h-5 text-blue-600 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
