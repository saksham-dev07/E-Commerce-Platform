'use client'

import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ShoppingCart, Star, Package, Heart, Eye, Search, Grid3X3, List, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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

export function ProductGridEnhanced({ showFilters = true, sellerId }: ProductGridProps) {
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
    <section id="products" className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {sellerId ? 'My Products' : 'Featured Products'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sellerId ? 'Manage your product listings' : 'Discover our hand-picked selection of the best products from trusted sellers'}
          </p>
        </div>

        {/* Filters and Controls */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, description, brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort products"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-4">
              <Label>Price Range (₹):</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-24"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="ml-auto flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-lg text-gray-600">
              {searchTerm || selectedCategory || priceRange.min || priceRange.max
                ? 'No products match your search criteria'
                : 'No products found. Be the first to add a product!'
              }
            </div>
            {(searchTerm || selectedCategory || priceRange.min || priceRange.max) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setPriceRange({ min: '', max: '' })
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              viewMode === 'grid' ? (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-white overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
                        <Package className="w-16 h-16 text-white opacity-70" />
                      </div>
                      
                      {/* Wishlist Button */}
                      {user?.role === 'BUYER' && (
                        <button
                          onClick={() => handleToggleWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
                          aria-label="Add to wishlist"
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                      )}
                      
                      {/* Stock Badge */}
                      <div className="absolute top-3 left-3">
                        {product.inStock ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Condition Badge */}
                      {product.condition && product.condition !== 'New' && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                            {product.condition}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.brand && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {product.brand}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Sold by {product.seller.name}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex space-x-2">
                    {user?.role === 'BUYER' && (
                      <>
                        <Button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.inStock}
                          className="flex-1"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    {!user && (
                      <Button onClick={() => alert('Please login to purchase')} className="w-full" size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                /* List View */
                <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <Package className="w-8 h-8 text-white opacity-70" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                              {product.brand && (
                                <Badge variant="outline" className="text-xs">
                                  {product.brand}
                                </Badge>
                              )}
                              {product.inStock ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            
                            {product.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              Sold by {product.seller.name}
                            </p>
                          </div>
                          
                          {/* Price and Actions */}
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {formatPrice(product.price)}
                            </div>
                            
                            <div className="flex items-center justify-end space-x-2">
                              {user?.role === 'BUYER' && (
                                <>
                                  <Button
                                    onClick={() => handleToggleWishlist(product.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                  </Button>
                                  <Button
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={!product.inStock}
                                    size="sm"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
