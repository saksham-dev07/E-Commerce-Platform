'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Plus, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Star,
  Clock,
  Target,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Zap,
  Award,
  Activity,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
  TrendingDown
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  category: string
  inStock: boolean
  createdAt: string
}

interface SellerStats {
  totalProducts: number
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  averageOrderValue: number
  conversionRate: number
  todayRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  todayOrders: number
  weeklyOrders: number
  monthlyOrders: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'product' | 'review' | 'message'
  title: string
  description: string
  timestamp: string
  status?: string
}

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
  gradient: string
  isNew?: boolean
}

export function SellerHomepage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    todayOrders: 0,
    weeklyOrders: 0,
    monthlyOrders: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true)
        
        // Fetch seller's products and analytics in parallel
        const [productsResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/products?sellerId=${user?.id}`),
          fetch('/api/seller/analytics')
        ])
        
        let fetchedProducts: Product[] = []
        if (productsResponse.ok) {
          const data = await productsResponse.json()
          fetchedProducts = data.products || []
          setProducts(fetchedProducts)
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          const analytics = analyticsData.analytics
          
          setStats({
            totalProducts: fetchedProducts.length,
            totalRevenue: analytics.totalRevenue || 0,
            totalOrders: analytics.totalOrders || 0,
            completedOrders: analytics.completedOrders || 0,
            pendingOrders: analytics.pendingOrders || 0,
            processingOrders: analytics.processingOrders || 0,
            shippedOrders: analytics.shippedOrders || 0,
            averageOrderValue: analytics.averageOrderValue || 0,
            conversionRate: analytics.conversionRate || 0,
            todayRevenue: 0, // Will be calculated from API in future
            weeklyRevenue: 0,
            monthlyRevenue: 0,
            todayOrders: 0,
            weeklyOrders: 0,
            monthlyOrders: 0
          })
        }
        
      } catch (error) {
        console.error('Error fetching seller data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchSellerData()
    }
  }, [user])

  const refreshData = async () => {
    try {
      setLoading(true)
      
      // Fetch seller's products and analytics in parallel
      const [productsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/products?sellerId=${user?.id}`),
        fetch('/api/seller/analytics')
      ])
      
      let fetchedProducts: Product[] = []
      if (productsResponse.ok) {
        const data = await productsResponse.json()
        fetchedProducts = data.products || []
        setProducts(fetchedProducts)
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        const analytics = analyticsData.analytics
        
        setStats({
          totalProducts: fetchedProducts.length,
          totalRevenue: analytics.totalRevenue || 0,
          totalOrders: analytics.totalOrders || 0,
          completedOrders: analytics.completedOrders || 0,
          pendingOrders: analytics.pendingOrders || 0,
          processingOrders: analytics.processingOrders || 0,
          shippedOrders: analytics.shippedOrders || 0,
          averageOrderValue: analytics.averageOrderValue || 0,
          conversionRate: analytics.conversionRate || 0,
          todayRevenue: 0, // Will be calculated from API in future
          weeklyRevenue: 0,
          monthlyRevenue: 0,
          todayOrders: 0,
          weeklyOrders: 0,
          monthlyOrders: 0
        })
      }
      
    } catch (error) {
      console.error('Error fetching seller data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Add New Product',
      description: 'List a new product in your store',
      icon: Plus,
      href: '/seller/add-product',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
      isNew: stats.totalProducts === 0
    },
    {
      title: 'Manage Orders',
      description: 'Process and track customer orders',
      icon: ShoppingBag,
      href: '/seller/orders',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed sales analytics',
      icon: BarChart3,
      href: '/seller/analytics',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Product Manager',
      description: 'Edit and manage your products',
      icon: Package,
      href: '/seller/dashboard',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Store Settings',
      description: 'Configure your store preferences',
      icon: Settings,
      href: '/seller/settings',
      color: 'text-gray-600',
      gradient: 'from-gray-500 to-slate-600'
    },
    {
      title: 'Help Center',
      description: 'Get support and learn best practices',
      icon: HelpCircle,
      href: '/seller/help',
      color: 'text-cyan-600',
      gradient: 'from-cyan-500 to-blue-600'
    }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Your Store</h2>
          <p className="text-gray-500">Please wait while we fetch your dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Dynamic Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center text-white">
              {stats.totalProducts === 0 ? (
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Welcome to Your Seller Journey! 🚀</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    Let's Build Your
                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Dream Store
                    </span>
                  </h1>
                  <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                    {user?.name}, you're just one step away from reaching millions of customers. 
                    Start by adding your first product and watch your business grow!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Activity className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Store Performance Dashboard</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    Welcome Back,
                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      {user?.name}! 👋
                    </span>
                  </h1>
                  <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                    Your store is looking great! You have {stats.totalProducts} products listed and 
                    have earned ₹{stats.totalRevenue.toFixed(2)} from {stats.completedOrders} completed orders.
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link href="/seller/add-product">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-6 h-6 mr-3" />
                    {stats.totalProducts === 0 ? 'Add Your First Product' : 'Add New Product'}
                  </Button>
                </Link>
                <Link href="/seller/analytics">
                  <Button size="lg" variant="outline" className="border-2 border-yellow-300 bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400 hover:text-yellow-900 font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm shadow-xl">
                    <BarChart3 className="w-6 h-6 mr-3" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/seller/orders">
                  <Button size="lg" variant="outline" className="border-2 border-emerald-300 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400 hover:text-emerald-900 font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm shadow-xl">
                    <ShoppingBag className="w-6 h-6 mr-3" />
                    View Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-20 relative z-10">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Products</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalProducts}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {stats.totalProducts > 0 ? 'Active' : 'Get Started'}
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
                  <p className="text-4xl font-bold mt-2">₹{stats.totalRevenue.toFixed(0)}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {stats.completedOrders} delivered
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
                  <p className="text-4xl font-bold mt-2">{stats.totalOrders}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {stats.pendingOrders + stats.processingOrders + stats.shippedOrders} active
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
                  <p className="text-4xl font-bold mt-2">{stats.conversionRate.toFixed(1)}%</p>
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

        {/* New Seller Welcome Section */}
        {stats.totalProducts === 0 && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">🚀 Launch Your Store Journey</h3>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">NEW</Badge>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    Welcome to our marketplace! You're about to join thousands of successful sellers. 
                    Start by adding your first product and we'll guide you through every step to success.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/seller/add-product">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Product
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold py-3 rounded-xl">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Seller Guide
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-semibold py-3 rounded-xl">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Get Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights - Only show if has data */}
        {stats.totalOrders > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  <CardTitle className="text-xl">📊 Performance Insights</CardTitle>
                </div>
                <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0">
                  This Week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₹{stats.averageOrderValue.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Average Order Value</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+12% from last week</span>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stats.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                  <div className="flex items-center justify-center mt-2">
                    <Target className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">Industry average: 2.5%</span>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Order Success Rate</div>
                  <div className="flex items-center justify-center mt-2">
                    <Award className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-xs text-purple-600">Excellent performance!</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Quick Actions */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-600" />
                <CardTitle className="text-2xl">⚡ Quick Actions</CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                Shortcuts
              </Badge>
            </div>
            <CardDescription className="text-base">
              Manage your store efficiently with these powerful tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${action.gradient}`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        {action.isNew && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs">
                            NEW
                          </Badge>
                        )}
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products - Enhanced */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-2xl">📦 Your Product Showcase</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {products.length === 0 
                      ? "Your product gallery awaits your first listing"
                      : `Showcasing ${products.length} product${products.length !== 1 ? 's' : ''} in your store`
                    }
                  </CardDescription>
                </div>
              </div>
              {products.length > 0 && (
                <Link href="/seller/dashboard">
                  <Button variant="outline" className="border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold px-6 py-2 rounded-xl">
                    Manage All
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Start Selling?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Your product showcase is empty. Add your first product to start attracting customers 
                  and building your online presence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/seller/add-product">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="w-6 h-6 mr-3" />
                      Add Your First Product
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-2xl">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Product Guide
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
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
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-emerald-600">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Listed {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-indigo-50 hover:border-indigo-300">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-emerald-50 hover:border-emerald-300">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Success Tips Section */}
        <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-0 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Lightbulb className="w-8 h-8 text-amber-600" />
                <CardTitle className="text-3xl font-bold text-gray-800">💡 Seller Success Academy</CardTitle>
              </div>
              <CardDescription className="text-lg text-gray-600">
                Expert tips and strategies to boost your sales and grow your business
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tip 1 */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">📸 Professional Photography</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  High-quality, well-lit photos can increase your sales by up to 40%. 
                  Show multiple angles and include lifestyle shots.
                </p>
                <Badge className="bg-blue-100 text-blue-800 border-0">Conversion Boost: +40%</Badge>
              </div>
              
              {/* Tip 2 */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">⭐ Detailed Descriptions</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Write compelling, detailed product descriptions with key features, 
                  benefits, and specifications. Use bullet points for clarity.
                </p>
                <Badge className="bg-emerald-100 text-emerald-800 border-0">SEO Impact: +60%</Badge>
              </div>
              
              {/* Tip 3 */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">💰 Smart Pricing Strategy</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Research competitor prices and consider your costs. Offer competitive 
                  pricing while maintaining healthy profit margins.
                </p>
                <Badge className="bg-purple-100 text-purple-800 border-0">Sales Impact: +25%</Badge>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">🚀 Ready to Implement These Tips?</h4>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Start applying these proven strategies today and watch your sales grow. 
                  Need help? Our seller support team is here for you!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/seller/add-product">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="w-5 h-5 mr-2" />
                      Apply Tips Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold px-8 py-3 rounded-xl">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Get Help
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
