'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  seller: { name: string }
}

interface WishlistItem {
  id: string
  product: Product
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlistItems || []) // Access the wishlistItems array from the response
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/buyer')
      return
    }
    
    if (user.role !== 'BUYER') {
      router.push('/')
      return
    }

    fetchWishlistItems()
  }, [user, router])

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      if (response.ok) {
        await fetchWishlistItems()
        // Refresh navbar counts
        if ((window as any).refreshNavbarCounts) {
          (window as any).refreshNavbarCounts()
        }
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })
      
      if (response.ok) {
        alert('Added to cart successfully!')
        // Refresh navbar counts
        if ((window as any).refreshNavbarCounts) {
          (window as any).refreshNavbarCounts()
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-6">
            Start adding products you love to your wishlist!
          </p>
          <Link href="/search">
            <Button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">by {item.product.seller.name}</p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{item.product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">₹{item.product.price}</span>
                  <Button
                    onClick={() => addToCart(item.product.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
