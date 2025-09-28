'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck,
  Star,
  ArrowUpIcon,
  ArrowDownIcon,
  Activity,
  Calendar,
  Users,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  Zap,
  Award,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Eye,
  MousePointer,
  ShoppingBag,
  Globe
} from 'lucide-react'
import Link from 'next/link'

interface Analytics {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  cancelledOrders: number
  totalRevenue: number
  potentialRevenue: number
  conversionRate: number
  averageOrderValue: number
  monthlyGrowth?: number
  weeklyGrowth?: number
  totalViews?: number
  clickThroughRate?: number
}

interface MonthlyData {
  month: string
  revenue: number
  orders: number
  growth?: number
}

interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
  price: number
  conversionRate?: number
  views?: number
}

interface PerformanceMetrics {
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  conversionRate: number
  averageOrderValue: number
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

// Progress Bar Component
const ProgressBar = ({ value, color, label }: { value: number; color: string; label?: string }) => {
  const percentage = Math.min(value, 100)
  
  // Create width class based on percentage ranges
  const getWidthClass = (perc: number) => {
    if (perc >= 100) return 'w-full'
    if (perc >= 90) return 'w-11/12'
    if (perc >= 80) return 'w-4/5'
    if (perc >= 75) return 'w-3/4'
    if (perc >= 66) return 'w-2/3'
    if (perc >= 60) return 'w-3/5'
    if (perc >= 50) return 'w-1/2'
    if (perc >= 40) return 'w-2/5'
    if (perc >= 33) return 'w-1/3'
    if (perc >= 25) return 'w-1/4'
    if (perc >= 20) return 'w-1/5'
    if (perc >= 10) return 'w-1/12'
    if (perc > 0) return 'w-1'
    return 'w-0'
  }
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>}
      <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-300 ${color} ${getWidthClass(percentage)}`}></div>
      </div>
    </div>
  )
}

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'conversion'>('revenue')
  const [timeRangeLoading, setTimeRangeLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const fetchAnalytics = async () => {
    try {
      setTimeRangeLoading(true)
      console.log('Fetching analytics for time range:', selectedTimeRange)
      const response = await fetch(`/api/seller/analytics?timeRange=${selectedTimeRange}`)
      console.log('Analytics response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data received:', data)
        setAnalytics(data.analytics)
        setMonthlyRevenue(data.monthlyRevenue || [])
        setTopProducts(data.topProducts || [])
      } else {
        console.error('Failed to fetch analytics:', response.status, response.statusText)
        // Set default values if API fails
        setAnalytics({
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          potentialRevenue: 0,
          conversionRate: 0,
          averageOrderValue: 0
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set default values if network error
      setAnalytics({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        potentialRevenue: 0,
        conversionRate: 0,
        averageOrderValue: 0
      })
    } finally {
      setLoading(false)
      setTimeRangeLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/seller')
      return
    }
    
    if (user.role !== 'SELLER') {
      router.push('/')
      return
    }

    fetchAnalytics()
  }, [user, router, selectedTimeRange])

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Analytics</h2>
          <p className="text-gray-500">Calculating your performance metrics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Analytics</h2>
            <p className="text-gray-600 mb-6">Unable to fetch your analytics data</p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-8 gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Advanced
                </Badge>
              </div>
              <p className="text-indigo-100 text-lg">
                Track your performance, analyze trends, and optimize your store's success.
              </p>
              <div className="mt-2">
                <Badge className="bg-white/30 text-white border-0 backdrop-blur-sm">
                  📊 Showing data for: {
                    selectedTimeRange === '7d' ? 'Last 7 days' :
                    selectedTimeRange === '30d' ? 'Last 30 days' :
                    selectedTimeRange === '90d' ? 'Last 90 days' :
                    'Last year'
                  }
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
                  aria-label="Select time range for analytics"
                  className={`w-44 bg-white/90 border-2 border-white/50 text-indigo-700 backdrop-blur-sm font-semibold shadow-lg hover:bg-white hover:border-white rounded-md px-4 py-2 pr-8 appearance-none cursor-pointer ${timeRangeLoading ? 'opacity-75' : ''}`}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  {timeRangeLoading ? (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline" 
                className="border-2 border-cyan-300 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400 hover:text-cyan-900 backdrop-blur-sm font-semibold shadow-lg"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button variant="outline" className="border-2 border-yellow-300 bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400 hover:text-yellow-900 backdrop-blur-sm font-semibold shadow-lg">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-12 relative z-10">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-emerald-100" />
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                <p className="text-4xl font-bold mt-1">₹{analytics.totalRevenue.toFixed(0)}</p>
                <p className="text-emerald-200 text-sm mt-1">
                  From {analytics.completedOrders} completed orders
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <ShoppingCart className="w-8 h-8 text-blue-100" />
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +8.3%
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Orders</p>
                <p className="text-4xl font-bold mt-1">{analytics.totalOrders}</p>
                <p className="text-blue-200 text-sm mt-1">
                  {analytics.pendingOrders + analytics.processingOrders + analytics.shippedOrders} active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Target className="w-8 h-8 text-purple-100" />
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +2.1%
                </div>
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Conversion Rate</p>
                <p className="text-4xl font-bold mt-1">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-purple-200 text-sm mt-1">
                  Industry avg: 2.5%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Award className="w-8 h-8 text-orange-100" />
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +15.7%
                </div>
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Avg Order Value</p>
                <p className="text-4xl font-bold mt-1">₹{analytics.averageOrderValue.toFixed(0)}</p>
                <p className="text-orange-200 text-sm mt-1">
                  Per completed order
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl">📊 Order Status Breakdown</CardTitle>
                  <CardDescription>Current distribution of your orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {analytics.completedOrders}
                    </Badge>
                    <ProgressBar 
                      value={(analytics.completedOrders / Math.max(analytics.totalOrders, 1)) * 100} 
                      color="bg-green-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {analytics.pendingOrders}
                    </Badge>
                    <ProgressBar 
                      value={(analytics.pendingOrders / Math.max(analytics.totalOrders, 1)) * 100} 
                      color="bg-yellow-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {analytics.processingOrders}
                    </Badge>
                    <ProgressBar 
                      value={(analytics.processingOrders / Math.max(analytics.totalOrders, 1)) * 100} 
                      color="bg-blue-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-sm font-medium">Shipped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {analytics.shippedOrders}
                    </Badge>
                    <ProgressBar 
                      value={(analytics.shippedOrders / Math.max(analytics.totalOrders, 1)) * 100} 
                      color="bg-purple-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Cancelled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {analytics.cancelledOrders}
                    </Badge>
                    <ProgressBar 
                      value={(analytics.cancelledOrders / Math.max(analytics.totalOrders, 1)) * 100} 
                      color="bg-red-500" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <div>
                  <CardTitle className="text-xl">💰 Revenue Insights</CardTitle>
                  <CardDescription>Your revenue performance overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">Realized Revenue</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{analytics.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600">From {analytics.completedOrders} delivered orders</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Potential Revenue</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{analytics.potentialRevenue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">Including pending orders</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">Average Order Value</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₹{analytics.averageOrderValue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600">Per completed transaction</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Revenue Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {((analytics.totalRevenue / Math.max(analytics.potentialRevenue, 1)) * 100).toFixed(1)}%
                    </span>
                    <ProgressBar 
                      value={(analytics.totalRevenue / Math.max(analytics.potentialRevenue, 1)) * 100} 
                      color="bg-gradient-to-r from-green-500 to-emerald-600" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-600" />
                <div>
                  <CardTitle className="text-xl">🏆 Top Performing Products</CardTitle>
                  <CardDescription>Your best-selling products by revenue</CardDescription>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0">
                Top {topProducts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sales Data Yet</h3>
                <p className="text-gray-500">Start selling to see your top products here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                        'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ₹{product.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        @ ₹{product.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-600" />
              <div>
                <CardTitle className="text-xl">⚡ Quick Actions</CardTitle>
                <CardDescription>Manage your store and optimize performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/seller/dashboard">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Package className="w-5 h-5 mr-2" />
                  Manage Products
                </Button>
              </Link>
              
              <Link href="/seller/orders">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  View Orders
                </Button>
              </Link>
              
              <Link href="/seller/add-product">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Package className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
