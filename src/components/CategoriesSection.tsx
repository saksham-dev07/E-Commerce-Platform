'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { 
  Smartphone, 
  Shirt, 
  Home, 
  BookOpen, 
  Gamepad2, 
  Watch,
  Car,
  Heart
} from 'lucide-react'

const categories = [
  {
    name: 'Electronics',
    icon: Smartphone,
    href: '/category/electronics',
    color: 'bg-blue-500'
  },
  {
    name: 'Fashion',
    icon: Shirt,
    href: '/category/fashion',
    color: 'bg-pink-500'
  },
  {
    name: 'Home & Garden',
    icon: Home,
    href: '/category/home',
    color: 'bg-green-500'
  },
  {
    name: 'Books',
    icon: BookOpen,
    href: '/category/books',
    color: 'bg-orange-500'
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    href: '/category/gaming',
    color: 'bg-purple-500'
  },
  {
    name: 'Watches',
    icon: Watch,
    href: '/category/watches',
    color: 'bg-yellow-500'
  },
  {
    name: 'Automotive',
    icon: Car,
    href: '/category/automotive',
    color: 'bg-red-500'
  },
  {
    name: 'Health & Beauty',
    icon: Heart,
    href: '/category/health',
    color: 'bg-teal-500'
  }
]

export function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our wide selection of products across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  )
}
