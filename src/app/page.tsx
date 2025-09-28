'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HeroSection } from '../components/HeroSection'
import { ProductGridEnhanced } from '../components/ProductGridEnhanced'
import { PopularCategoriesSection } from '../components/PopularCategoriesSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { DealsSection } from '../components/DealsSection'
import { NewsletterSection } from '../components/NewsletterSection'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Handle seller redirects and token checking
  useEffect(() => {
    // Only check for sellers who directly navigate to homepage (not from login)
    // This prevents interference with login redirects
    if (user && user.role === 'SELLER') {
      // Add a small delay to avoid race conditions with login redirects
      const timer = setTimeout(() => {
        router.replace('/seller/dashboard')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  // Show loading during authentication checks
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // If user is a seller, show loading while redirecting (prevent buyer content flash)
  if (user && user.role === 'SELLER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Redirecting to dashboard...</div>
      </div>
    )
  }

  // Show regular homepage for buyers and non-authenticated users
  return (
    <div className="space-y-0">
      <HeroSection />
      <PopularCategoriesSection />
      <section id="products">
        <ProductGridEnhanced />
      </section>
      <FeaturesSection />
      <DealsSection />
      <NewsletterSection />
    </div>
  )
}
