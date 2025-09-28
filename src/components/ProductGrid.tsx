'use client'

import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { ShoppingCart, Star, Package, Heart, Eye, Filter, Search, Grid3X3, List, SortAsc } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  condition?: string
  brand?: string
  inStock: boolean
  seller: {
    name: string
  }
  createdAt: string
}

interface ProductGridProps {
  showFilters?: boolean
  sellerId?: string
}

export function ProductGrid({ showFilters = true, sellerId }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')
  const [wishlist, setWishlist] = useState<string[]>([])
  const { user } = useAuth()

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Jewelry & Accessories',
    'Food & Beverages',
    'Pet Supplies',
    'Office Supplies'
  ]

  useEffect(() => {
    fetchProducts()
    if (user?.role === 'BUYER') {
      fetchWishlist()
    }
  }, [sellerId])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, priceRange, sortBy])

  const fetchProducts = async () => {
    try {
      const url = sellerId ? `/api/products?sellerId=${sellerId}` : '/api/products'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        setError('Failed to load products')
      }
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlist(data.wishlistItems.map((item: any) => item.productId))
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max))
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = async (productId: string) => {
    if (!user || user.role !== 'BUYER') {
      alert('Please login as a buyer to add items to cart')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      const data = await response.json()
      if (response.ok) {
        alert('Added to cart successfully!')
        // Refresh navbar counts
        if ((window as any).refreshNavbarCounts) {
          (window as any).refreshNavbarCounts()
        }
      } else {
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Error adding to cart')
    }
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!user || user.role !== 'BUYER') {
      alert('Please login as a buyer to manage wishlist')
      return
    }

    try {
      const isInWishlist = wishlist.includes(productId)
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        
        if (response.ok) {
          setWishlist(prev => prev.filter(id => id !== productId))
          alert('Removed from wishlist')
          // Refresh navbar counts
          if ((window as any).refreshNavbarCounts) {
            (window as any).refreshNavbarCounts()
          }
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        
        if (response.ok) {
          setWishlist(prev => [...prev, productId])
          alert('Added to wishlist')
          // Refresh navbar counts
          if ((window as any).refreshNavbarCounts) {
            (window as any).refreshNavbarCounts()
          }
        }
      }
    } catch (error) {
      alert('Error updating wishlist')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our hand-picked selection of the best products from trusted sellers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-gray-600">No products found. Be the first to add a product!</div>
          </div>
        ) : (
          products.map((product, index) => (
            <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.02] bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No Image</p>
                      </div>
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Badge className="bg-white/90 text-gray-900 font-semibold border-0 shadow-lg">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg backdrop-blur-sm">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-600">
                      Sold by <span className="font-semibold">{product.seller.name}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <div className="flex gap-2 w-full">
                  <Button
                    className={`flex-1 font-semibold py-3 rounded-xl transition-all duration-200 ${
                      product.inStock 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  {user && user.role === 'BUYER' && product.inStock && (
                    <Button
                      variant="outline"
                      className="px-4 py-3 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                      onClick={() => handleToggleWishlist(product.id)}
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
        </div>

        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all duration-200"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
