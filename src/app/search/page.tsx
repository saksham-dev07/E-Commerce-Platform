'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { ShoppingCart, Heart, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  inStock: boolean
  seller: {
    name: string
  }
  createdAt: string
}

interface SearchResults {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalProducts: number
    hasNext: boolean
    hasPrev: boolean
  }
  searchQuery: string
  category: string
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const page = searchParams.get('page') || '1'
    
    setSearchQuery(query)
    performSearch(query, category, parseInt(page))
  }, [searchParams])

  const performSearch = async (query: string, category: string = '', page: number = 1) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (category) params.append('category', category)
      params.append('page', page.toString())

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        setError('Search failed')
      }
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/search?${params}`)
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
      } else {
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      alert('Error adding to cart')
    }
  }

  const handleAddToWishlist = async (productId: string) => {
    if (!user || user.role !== 'BUYER') {
      alert('Please login as a buyer to add items to wishlist')
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      const data = await response.json()
      if (response.ok) {
        alert('Added to wishlist successfully!')
      } else {
        alert(data.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      alert('Error adding to wishlist')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
            />
          </div>
        </form>
      </div>

      {/* Results Header */}
      {results && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {results.searchQuery 
              ? `Search Results for "${results.searchQuery}"` 
              : 'All Products'
            }
          </h1>
          <p className="text-gray-600">
            {results.pagination.totalProducts} products found
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Searching...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <>
          {results.products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">
                No products found. Try a different search term.
              </div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {results.products.map((product) => (
                  <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.02] bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                          {product.category}
                        </Badge>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center mb-3">
                          <span className="text-sm text-gray-600">
                            by <span className="font-semibold">{product.seller.name}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          className="flex-1 font-semibold py-2 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        {user && user.role === 'BUYER' && (
                          <Button
                            variant="outline"
                            className="px-3 py-2 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                            onClick={() => handleAddToWishlist(product.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {results.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    disabled={!results.pagination.hasPrev}
                    onClick={() => handlePageChange(results.pagination.currentPage - 1)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {[...Array(Math.min(5, results.pagination.totalPages))].map((_, i) => {
                      const pageNum = results.pagination.currentPage - 2 + i
                      if (pageNum < 1 || pageNum > results.pagination.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === results.pagination.currentPage ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    disabled={!results.pagination.hasNext}
                    onClick={() => handlePageChange(results.pagination.currentPage + 1)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
