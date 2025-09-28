'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { SellerHomepage } from '../../components/SellerHomepage'

export default function SellerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not a seller (but only after auth is loaded)
  useEffect(() => {
    if (!authLoading && user && user.role !== 'SELLER') {
      router.push('/')
    }
  }, [user, router, authLoading])

  // Redirect if not authenticated at all (but only after auth is loaded)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/seller')
    }
  }, [user, router, authLoading])

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render the homepage if user is authenticated and is a seller
  if (user && user.role === 'SELLER') {
    return <SellerHomepage />
  }

  // Return null while redirecting
  return null
}
