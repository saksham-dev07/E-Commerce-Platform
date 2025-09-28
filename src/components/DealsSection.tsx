'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Clock, Truck, Tag, Percent } from 'lucide-react'
import Link from 'next/link'

const promotions = [
  {
    id: 1,
    title: "Free Shipping",
    description: "Free delivery on orders over ₹500",
    highlight: "₹500+",
    color: "from-blue-500 to-cyan-500",
    icon: Truck
  },
  {
    id: 2,
    title: "Best Prices",
    description: "Competitive prices on all products",
    highlight: "Daily",
    color: "from-green-500 to-emerald-500",
    icon: Tag
  },
  {
    id: 3,
    title: "New User Benefit",
    description: "Special pricing for first-time buyers",
    highlight: "Welcome",
    color: "from-purple-500 to-pink-500",
    icon: Percent
  }
]

export function DealsSection() {

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🎯 Special Offers & Benefits
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Enjoy great benefits and competitive pricing on our marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <Card key={promo.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${promo.color} p-6 text-center`}>
                  <promo.icon className="w-12 h-12 mx-auto mb-4 text-white" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {promo.title}
                  </h3>
                  <div className="text-2xl font-bold text-white mb-2">
                    {promo.highlight}
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 text-center mb-6">
                    {promo.description}
                  </p>
                  
                  <Link href="/search" className="block">
                    <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Promo Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            � Start Your Shopping Journey
          </h3>
          <p className="text-blue-100 text-lg mb-6">
            Discover quality products from verified sellers with secure payment and fast delivery
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                Browse Products
              </Button>
            </Link>
            <Link href="/auth/seller">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8">
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
