'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Eye, 
  AlertCircle, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Star,
  Target,
  Activity,
  Calendar,
  ArrowUpRight,
  Zap,
  ShoppingBag,
  Users,
  Award
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  inStock: boolean
  createdAt: string
  views?: number
  sales?: number
}

interface Analytics {
  totalProducts: number
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  cancelledOrders: number
  conversionRate: number
  averageOrderValue: number
  potentialRevenue: number
}

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'price' | 'created' | 'views' | 'sales'
type SortOrder = 'asc' | 'desc'

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // New state for enhanced functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('created')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [categories, setCategories] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true
  })

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

  // Main data fetching function
  const fetchSellerData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      // Fetch products and analytics in parallel
      const [productsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/products?sellerId=${user.id}`),
        fetch('/api/seller/analytics')
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
      } else {
        setError('Failed to load products')
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics)
      } else {
        console.error('Failed to load analytics')
      }

    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'SELLER') {
      fetchSellerData()
    }
  }, [user])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => 
        stockFilter === 'inStock' ? product.inStock : !product.inStock
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'views':
          aValue = a.views || 0
          bValue = b.views || 0
          break
        case 'sales':
          aValue = a.sales || 0
          bValue = b.sales || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder])

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))]
    setCategories(uniqueCategories)
  }, [products])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSellerData()
    setRefreshing(false)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setStockFilter('all')
    setSortBy('created')
    setSortOrder('desc')
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        setShowDeleteConfirm(null)
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.error.includes('order history')) {
          // Product has order history, offer alternative
          const markOutOfStock = confirm(
            'This product cannot be deleted because it has order history. Would you like to mark it as "Out of Stock" instead?'
          )
          if (markOutOfStock) {
            await handleToggleStock(productId, false)
          }
        } else {
          alert(`Failed to delete product: ${errorData.error || 'Unknown error'}`)
        }
        setShowDeleteConfirm(null)
      }
    } catch (error) {
      alert('Error deleting product')
      setShowDeleteConfirm(null)
    }
  }

  const handleToggleStock = async (productId: string, inStock: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inStock }),
      })

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, inStock } : p
        ))
      } else {
        alert('Failed to update product stock status')
      }
    } catch (error) {
      alert('Error updating product stock status')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      inStock: product.inStock
    })
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          category: editForm.category,
          inStock: editForm.inStock
        }),
      })

      if (response.ok) {
        const { product: updatedProduct } = await response.json()
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ))
        setEditingProduct(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to update product: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Error updating product')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Please wait while we load your seller dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (user.role !== 'SELLER') {
    return null // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Your Products</h2>
            <p className="text-gray-500">Fetching your store data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-8 gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold">Product Dashboard</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Welcome back, {user.name}! Manage your {products.length} products with powerful tools.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline" 
                className="border-2 border-cyan-300 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400 hover:text-cyan-900 backdrop-blur-sm font-semibold shadow-lg"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Link href="/seller/analytics">
                <Button variant="outline" className="border-2 border-yellow-300 bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400 hover:text-yellow-900 backdrop-blur-sm font-semibold shadow-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analytics
                </Button>
              </Link>
              
              <Link href="/seller/orders">
                <Button variant="outline" className="border-2 border-emerald-300 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400 hover:text-emerald-900 backdrop-blur-sm font-semibold shadow-lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Orders
                </Button>
              </Link>
              
              <Link href="/seller/add-product">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-12 relative z-10">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Products</p>
                    <p className="text-4xl font-bold mt-2">{products.length}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {products.filter(p => p.inStock).length} in stock
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Package className="w-8 h-8 text-emerald-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Revenue</p>
                    <p className="text-4xl font-bold mt-2">₹{analytics.totalRevenue.toFixed(0)}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {analytics.completedOrders} completed
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-blue-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Orders</p>
                    <p className="text-4xl font-bold mt-2">{analytics.totalOrders}</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        {analytics.pendingOrders + analytics.processingOrders + analytics.shippedOrders} active
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <ShoppingBag className="w-8 h-8 text-purple-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Success Rate</p>
                    <p className="text-4xl font-bold mt-2">{analytics.conversionRate.toFixed(1)}%</p>
                    <div className="flex items-center mt-2">
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        Conversion
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-orange-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Filters and Controls */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl">🎛️ Product Controls</CardTitle>
                  <CardDescription>Search, filter, and organize your products</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select 
                value={stockFilter} 
                onChange={(e) => setStockFilter(e.target.value)}
                aria-label="Filter by stock status"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="all">All Products</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>

              {/* Sort */}
              <div className="flex gap-2">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  aria-label="Sort products by"
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="created">Date Created</option>
                  <option value="views">Views</option>
                  <option value="sales">Sales</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 border-gray-300 hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <XCircle className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Category: {selectedCategory}
                  <XCircle className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {stockFilter !== 'all' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Stock: {stockFilter === 'inStock' ? 'In Stock' : 'Out of Stock'}
                  <XCircle className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setStockFilter('all')} />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl">📦 Your Products</CardTitle>
                  <CardDescription>
                    Showing {filteredProducts.length} of {products.length} products
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                {filteredProducts.length} products
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  {products.length === 0 ? 'No Products Yet' : 'No Products Match Your Filters'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {products.length === 0 
                    ? 'Start by adding your first product to your store'
                    : 'Try adjusting your search criteria or filters to find products'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/seller/add-product">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                  {products.length > 0 && (
                    <Button variant="outline" onClick={resetFilters} className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                      <Filter className="w-5 h-5 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    // Grid View
                    <Card key={product.id} className="border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge 
                            variant={product.inStock ? "default" : "secondary"}
                            className={product.inStock 
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" 
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                            }
                          >
                            {product.inStock ? "🟢 In Stock" : "🔴 Out of Stock"}
                          </Badge>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            {product.category}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                          {product.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {product.description || "No description available"}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-emerald-600">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Listed {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 hover:border-blue-300" onClick={() => setViewingProduct(product)}>
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 hover:bg-emerald-50 hover:border-emerald-300" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleStock(product.id, !product.inStock)}
                            className={`hover:border-orange-300 ${
                              product.inStock ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={product.inStock ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                          >
                            {product.inStock ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="hover:bg-red-50 hover:border-red-300 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // List View
                    <Card key={product.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                              <Package className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                <Badge 
                                  variant={product.inStock ? "default" : "secondary"}
                                  className={product.inStock 
                                    ? "bg-green-100 text-green-800 border-0" 
                                    : "bg-gray-100 text-gray-800 border-0"
                                  }
                                >
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 truncate mb-1">
                                {product.description || "No description"}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Category: {product.category}</span>
                                <span>•</span>
                                <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">
                                ₹{product.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="hover:bg-blue-50" onClick={() => setViewingProduct(product)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="hover:bg-emerald-50" onClick={() => handleEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleToggleStock(product.id, !product.inStock)}
                                className={`hover:border-orange-300 ${
                                  product.inStock ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={product.inStock ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                              >
                                {product.inStock ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowDeleteConfirm(product.id)}
                                className="hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  Confirm Deletion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteProduct(showDeleteConfirm)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Edit className="w-6 h-6" />
                  Edit Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category-select"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Books">Books</option>
                    <option value="Toys & Games">Toys & Games</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Tools & Hardware">Tools & Hardware</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={editForm.inStock}
                    onChange={(e) => setEditForm({...editForm, inStock: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    In Stock
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProduct(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!editForm.name || !editForm.price || !editForm.category}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Product Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Eye className="w-6 h-6" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="space-y-4">
                    {viewingProduct.imageUrl ? (
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={viewingProduct.imageUrl} 
                          alt={viewingProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                        <Package className="w-16 h-16 text-gray-400" />
                        <span className="sr-only">No image available</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                      <p className="text-lg font-semibold text-gray-900">{viewingProduct.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                      <p className="text-2xl font-bold text-emerald-600">₹{viewingProduct.price.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                      <Badge variant="secondary" className="text-sm">
                        {viewingProduct.category}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Stock Status</label>
                      <Badge 
                        variant={viewingProduct.inStock ? "default" : "secondary"}
                        className={viewingProduct.inStock 
                          ? "bg-green-100 text-green-800 border-0" 
                          : "bg-gray-100 text-gray-800 border-0"
                        }
                      >
                        {viewingProduct.inStock ? "🟢 In Stock" : "🔴 Out of Stock"}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                      <p className="text-gray-700">{new Date(viewingProduct.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {viewingProduct.description || "No description provided"}
                    </p>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {viewingProduct.views || 0}
                    </div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {viewingProduct.sales || 0}
                    </div>
                    <div className="text-sm text-gray-600">Sales</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {new Date(viewingProduct.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-sm text-gray-600">Created</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewingProduct(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewingProduct(null)
                      handleEditProduct(viewingProduct)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
