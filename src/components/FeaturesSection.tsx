'use client'

import { Card, CardContent } from './ui/card'
import { 
  Shield, 
  Truck, 
  CreditCard, 
  Headphones, 
  RotateCcw, 
  Award,
  Clock,
  Users
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "Your data and payments are protected with bank-level security",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Free shipping on orders over ₹500. Express delivery available",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description: "Pay with cards, UPI, wallets, or cash on delivery",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you anytime",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns within 30 days of purchase",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "All products are verified and come with quality assurance",
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    icon: Clock,
    title: "Quick Checkout",
    description: "Streamlined checkout process that takes less than 2 minutes",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: Users,
    title: "Trusted Sellers",
    description: "All sellers are verified and rated by our community",
    color: "bg-pink-100 text-pink-600"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Marketplace?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're committed to providing you with the best online shopping experience with 
            features designed for your convenience and peace of mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:scale-105 group"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
