'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Package, 
  DollarSign, 
  User, 
  AlertCircle, 
  Truck,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  Navigation,
  Timer,
  Target,
  Award,
  Activity,
  BarChart3,
  Route,
  Fuel
} from 'lucide-react'

interface Order {
  id: string
  total: number
  status: string
  shippingAddress: string
  createdAt: string
  buyer: {
    name: string
    email: string
    city: string
  }
  orderItems: Array<{
    quantity: number
    price: number
    product: {
      name: string
      seller: {
        name: string
      }
    }
  }>
}

interface Stats {
  totalDeliveries: number
  pendingDeliveries: number
  completedToday: number
  earnings: number
  weeklyEarnings: number
  monthlyEarnings: number
  totalDistance: number
  averageRating: number
  completionRate: number
  onTimeDeliveries: number
  totalOrders: number
  activeDays: number
}

export default function DeliveryAgentDashboard() {
  const [deliveryAgent, setDeliveryAgent] = useState<any>(null)
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedToday: 0,
    earnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalDistance: 0,
    averageRating: 4.8,
    completionRate: 95,
    onTimeDeliveries: 0,
    totalOrders: 0,
    activeDays: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Safe number formatting function
  const formatNumber = (value: any, defaultValue: number = 0): string => {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return String(defaultValue)
    }
    return String(num)
  }

  // Safe percentage formatting
  const formatPercentage = (value: any, defaultValue: number = 0): string => {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return `${defaultValue}%`
    }
    return `${num}%`
  }

  // Safe currency formatting
  const formatCurrency = (value: any, defaultValue: number = 0): string => {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return `₹${defaultValue}`
    }
    return `₹${num}`
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Delivery fee calculation system
  const calculateDeliveryEarnings = (orderTotal: number) => {
    if (orderTotal < 500) {
      // For orders below ₹500, charge ₹40 delivery fee + ₹25 agent commission
      return {
        deliveryFee: 40,
        agentEarning: 65, // ₹40 delivery fee + ₹25 base commission
        feeType: 'standard',
        description: 'Delivery Fee + Commission'
      }
    } else if (orderTotal >= 500 && orderTotal < 1000) {
      // For orders ₹500-999, free delivery but ₹35 agent commission
      return {
        deliveryFee: 0,
        agentEarning: 35,
        feeType: 'free_delivery',
        description: 'Free Delivery Commission'
      }
    } else if (orderTotal >= 1000 && orderTotal < 2000) {
      // For orders ₹1000-1999, free delivery + ₹50 premium commission
      return {
        deliveryFee: 0,
        agentEarning: 50,
        feeType: 'premium',
        description: 'Premium Order Commission'
      }
    } else {
      // For orders ₹2000+, free delivery + ₹75 high-value commission
      return {
        deliveryFee: 0,
        agentEarning: 75,
        feeType: 'high_value',
        description: 'High-Value Order Commission'
      }
    }
  }

  const getEarningsBadgeColor = (feeType: string) => {
    switch (feeType) {
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'free_delivery': return 'bg-green-100 text-green-800 border-green-300'
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'high_value': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    // Check if delivery agent is logged in
    const token = localStorage.getItem('deliveryAgentToken')
    if (!token) {
      window.location.href = '/auth/delivery-agent'
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('deliveryAgentToken')
      
      // Fetch delivery agent profile
      const profileResponse = await fetch('/api/auth/delivery-agent/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setDeliveryAgent(profileData.deliveryAgent)
        
        // Fetch assigned orders with agent ID
        const ordersResponse = await fetch(`/api/delivery-agent/orders-temp`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          console.log('Orders data:', ordersData) // Debug log
          setAssignedOrders(ordersData.assignedOrders || [])
          setAvailableOrders(ordersData.availableOrders || [])
          
          // Show debug info
          if (ordersData.debug) {
            console.log('Debug info:', ordersData.debug)
          }
        } else {
          console.error('Failed to fetch orders:', ordersResponse.status)
          const errorData = await ordersResponse.json()
          console.error('Error details:', errorData)
        }

        // Fetch stats with agent ID - Enhanced with better calculations
        const statsResponse = await fetch(`/api/delivery-agent/stats?agentId=${profileData.deliveryAgent.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log('📊 Raw stats data from API:', statsData)
          
          // Enhanced stats with calculated values and fallbacks
          const apiStats = statsData.stats || {}
          console.log('📈 Parsed API stats object:', apiStats)
          
          const enhancedStats = {
            totalDeliveries: Number(apiStats.totalDeliveries) || 0,
            pendingDeliveries: Number(apiStats.pendingDeliveries) || assignedOrders.length,
            completedToday: Number(apiStats.completedToday) || 0,
            earnings: Number(apiStats.earnings) || 0,
            weeklyEarnings: Number(apiStats.weeklyEarnings) || (Number(apiStats.earnings) || 0) * 7,
            monthlyEarnings: Number(apiStats.monthlyEarnings) || (Number(apiStats.earnings) || 0) * 30,
            totalDistance: Number(apiStats.totalDistance) || Math.round((Number(apiStats.totalDeliveries) || 0) * 15.5),
            averageRating: Number(apiStats.averageRating) || 4.8,
            completionRate: Number(apiStats.completionRate) || 95,
            onTimeDeliveries: Number(apiStats.onTimeDeliveries) || Math.round((Number(apiStats.totalDeliveries) || 0) * 0.92),
            totalOrders: Number(apiStats.totalOrders) || (Number(apiStats.totalDeliveries) || 0) + (Number(apiStats.pendingDeliveries) || 0),
            activeDays: Number(apiStats.activeDays) || Math.min(Number(apiStats.totalDeliveries) || 0, 30)
          }
          
          console.log('✅ Enhanced stats with Number conversion:', enhancedStats)
          setStats(enhancedStats)
        } else {
          console.warn('⚠️ Stats API failed, using real empty data')
          // Use real empty data - no fake numbers
          const emptyStats = {
            totalDeliveries: 0,
            pendingDeliveries: assignedOrders.length || 0,
            completedToday: 0,
            earnings: 0,
            weeklyEarnings: 0,
            monthlyEarnings: 0,
            totalDistance: 0,
            averageRating: 0,
            completionRate: 0,
            onTimeDeliveries: 0,
            totalOrders: 0,
            activeDays: 0
          }
          console.log('🔧 Using empty real stats:', emptyStats)
          setStats(emptyStats)
        }
      } else {
        console.error('Failed to fetch profile:', profileResponse.status)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('deliveryAgentToken')
      const response = await fetch('/api/delivery-agent/update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Enhanced success message with earnings info
        if (result.earnings) {
          alert(`🎉 ${result.message}\n💰 Earnings: ₹${result.earnings.agentEarning}\n📋 Type: ${result.earnings.description}`)
        } else {
          alert(`✅ ${result.message}`)
        }
        
        // Refresh orders
        fetchDashboardData()
      } else {
        const error = await response.json()
        alert(`❌ Failed to update order: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('❌ Error updating order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'ASSIGNED': return 'SHIPPED'
      case 'SHIPPED': return 'DELIVERED'
      default: return null
    }
  }

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'ASSIGNED': return 'Mark as Picked Up'
      case 'SHIPPED': return 'Mark as Delivered'
      default: return null
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('deliveryAgentToken')
    window.location.href = '/auth/delivery-agent'
  }

  const triggerOrderAssignment = async () => {
    try {
      const response = await fetch('/api/delivery/assign-agents', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Assignment result:', result)
        alert(`Assignment complete: ${result.message}`)
        // Refresh dashboard data
        fetchDashboardData()
      } else {
        const error = await response.json()
        alert(`Assignment failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error triggering assignment:', error)
      alert('Error triggering order assignment')
    }
  }

  const claimOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('deliveryAgentToken')
      const response = await fetch('/api/delivery-agent/orders-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Order claimed successfully!`)
        // Refresh dashboard data
        fetchDashboardData()
      } else {
        const error = await response.json()
        alert(`Failed to claim order: ${error.error}`)
        console.error('Claim error:', error)
      }
    } catch (error) {
      console.error('Error claiming order:', error)
      alert('Error claiming order')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {deliveryAgent?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getGreeting()}, {deliveryAgent?.name || 'Delivery Agent'}! 🚚
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-2">
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {deliveryAgent?.city}, {deliveryAgent?.state}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {deliveryAgent?.vehicleType}
                  </p>
                  <p className="text-gray-500 flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatTime(currentTime)}
                  </p>
                  <Badge className="bg-green-100 text-green-800 border-green-300 w-fit">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Online & Available
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={triggerOrderAssignment} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Check New Orders
              </Button>
              <Button onClick={fetchDashboardData} variant="outline" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Refresh Data
              </Button>
              <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Agent Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Deliveries</CardTitle>
              <Package className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats.totalDeliveries)}</div>
              <p className="text-xs text-blue-200 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">Pending Deliveries</CardTitle>
              <Clock className="h-5 w-5 text-yellow-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats.pendingDeliveries)}</div>
              <p className="text-xs text-yellow-200 mt-1">
                <Timer className="inline h-3 w-3 mr-1" />
                Ready for pickup
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Today's Earnings</CardTitle>
              <DollarSign className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.earnings)}</div>
              <p className="text-xs text-green-200 mt-1">
                <Target className="inline h-3 w-3 mr-1" />
                {formatNumber(stats.completedToday)} orders completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Success Rate</CardTitle>
              <Award className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPercentage(stats.completionRate)}</div>
              <p className="text-xs text-purple-200 mt-1">
                <Star className="inline h-3 w-3 mr-1" />
                {formatNumber(stats.averageRating)}/5.0 rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="shadow-lg border border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <BarChart3 className="h-5 w-5" />
                Earnings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.earnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold text-blue-600">{formatCurrency(stats.weeklyEarnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-purple-600">{formatCurrency(stats.monthlyEarnings)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/5"></div>
              </div>
              <p className="text-xs text-gray-500">65% of monthly target achieved</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Route className="h-5 w-5" />
                Delivery Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Distance</span>
                <span className="font-semibold">{formatNumber(stats.totalDistance)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On-time Rate</span>
                <span className="font-semibold text-green-600">{formatPercentage(stats.completionRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Days</span>
                <span className="font-semibold">{formatNumber(stats.activeDays)} days</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Fuel className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Avg. 15km per delivery</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Star className="h-5 w-5" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{formatNumber(stats.averageRating, 4.8)}</div>
                <div className="flex justify-center gap-1 mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= Number(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Customer Rating</p>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-semibold">{formatPercentage(stats.completionRate)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information - Enhanced */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Agent Information & Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800">Location Details</h4>
                <div className="text-sm space-y-1">
                  <div><strong>State:</strong> {deliveryAgent?.state || 'Loading...'}</div>
                  <div><strong>City:</strong> {deliveryAgent?.city || 'Loading...'}</div>
                  <div><strong>Service Area:</strong> Urban</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800">Order Status</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Assigned:</strong> {assignedOrders.length}</div>
                  <div><strong>Available:</strong> {availableOrders.length}</div>
                  <div><strong>Capacity:</strong> 8 orders max</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800">Contact Info</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{deliveryAgent?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{deliveryAgent?.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800">Vehicle Info</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Type:</strong> {deliveryAgent?.vehicleType || 'Not set'}</div>
                  <div><strong>Status:</strong> <span className="text-green-600">Active</span></div>
                  <div><strong>Last Update:</strong> Just now</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-700">
                💡 <strong>Pro Tip:</strong> Open browser console (F12) to see detailed API responses and system logs
              </p>
            </div>
            <div className="mt-3 p-3 bg-green-100 rounded-lg">
              <p className="text-xs text-green-700">
                💰 <strong>Delivery Fee System Active:</strong> Orders below ₹500 include ₹40 delivery fee + ₹25 commission = ₹65 total earnings. Higher value orders get premium commissions (₹35-₹75 based on order value).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Fee Structure Information */}
        <Card className="shadow-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <DollarSign className="h-5 w-5" />
              Delivery Earnings Structure
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Understand how your earnings are calculated based on order value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Standard Orders */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">Standard</Badge>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">Orders below ₹500</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">• Customer pays ₹40 delivery fee</p>
                  <p className="text-gray-600">• You earn: <span className="font-bold text-blue-600">₹65</span></p>
                  <p className="text-xs text-gray-500">(₹40 delivery fee + ₹25 commission)</p>
                </div>
              </div>

              {/* Free Delivery */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">Free Delivery</Badge>
                </div>
                <h4 className="font-semibold text-green-800 mb-2">₹500 - ₹999</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">• Free delivery for customer</p>
                  <p className="text-gray-600">• You earn: <span className="font-bold text-green-600">₹35</span></p>
                  <p className="text-xs text-gray-500">(Base commission)</p>
                </div>
              </div>

              {/* Premium Orders */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">Premium</Badge>
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">₹1000 - ₹1999</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">• Free delivery for customer</p>
                  <p className="text-gray-600">• You earn: <span className="font-bold text-purple-600">₹50</span></p>
                  <p className="text-xs text-gray-500">(Premium commission)</p>
                </div>
              </div>

              {/* High Value Orders */}
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400">High Value</Badge>
                </div>
                <h4 className="font-semibold text-orange-800 mb-2">₹2000+</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">• Free delivery for customer</p>
                  <p className="text-gray-600">• You earn: <span className="font-bold text-orange-600">₹75</span></p>
                  <p className="text-xs text-gray-500">(High-value commission)</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-indigo-100 rounded-lg">
              <div className="flex items-start gap-2">
                <Award className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-indigo-800 mb-1">Pro Tips for Maximum Earnings:</h5>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• High-value orders (₹2000+) give you the best commission rates</li>
                    <li>• Standard orders (below ₹500) include delivery fees for extra income</li>
                    <li>• Complete deliveries on time to maintain your 5-star rating</li>
                    <li>• Stay active during peak hours (12-2 PM, 7-9 PM) for more orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Assigned Orders - Enhanced */}
          <Card className="shadow-xl border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="h-5 w-5" />
                My Assigned Orders
                <Badge className="bg-blue-100 text-blue-800 ml-auto">
                  {assignedOrders.length} Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-600">
                Orders currently assigned to you for delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned orders</h3>
                  <p className="text-gray-500 mb-4">Check available orders to claim new deliveries.</p>
                  <Button onClick={triggerOrderAssignment} className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Orders
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {assignedOrders.map((order, index) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {order.buyer.name} • {order.buyer.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge variant="secondary" className="text-lg font-bold">
                              ₹{order.total}
                            </Badge>
                          </div>
                          {/* Delivery Earnings Display */}
                          <div className="text-right">
                            {(() => {
                              const earnings = calculateDeliveryEarnings(order.total)
                              return (
                                <div className="space-y-1">
                                  <Badge className={getEarningsBadgeColor(earnings.feeType)}>
                                    💰 Earn ₹{earnings.agentEarning}
                                  </Badge>
                                  <p className="text-xs text-gray-500">{earnings.description}</p>
                                  {earnings.deliveryFee > 0 && (
                                    <p className="text-xs text-blue-600">+ ₹{earnings.deliveryFee} delivery fee</p>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Items ({order.orderItems.length})</p>
                            <div className="text-sm text-gray-600">
                              {order.orderItems.map((item, itemIndex) => (
                                <span key={itemIndex} className="inline-block mr-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.quantity}x {item.product.name}
                                  </Badge>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {getNextStatus(order.status) && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {getStatusAction(order.status)}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <Navigation className="h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Orders - Enhanced */}
          <Card className="shadow-xl border border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                Available Orders
                <Badge className="bg-green-100 text-green-800 ml-auto">
                  {availableOrders.length} Available
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-600">
                Orders available for delivery in your state: {deliveryAgent?.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {availableOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No available orders</h3>
                  <p className="text-gray-500 mb-4">Check back later for new orders in your area.</p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={fetchDashboardData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button onClick={triggerOrderAssignment} className="bg-green-600 hover:bg-green-700">
                      Auto-Assign Orders
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableOrders.map((order, index) => (
                    <div key={order.id} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-green-800">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {order.buyer.name} • {order.buyer.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-white">
                              AVAILABLE
                            </Badge>
                            <Badge className="bg-green-600 text-white text-lg font-bold">
                              ₹{order.total}
                            </Badge>
                          </div>
                          {/* Delivery Earnings Display */}
                          <div className="text-right">
                            {(() => {
                              const earnings = calculateDeliveryEarnings(order.total)
                              return (
                                <div className="space-y-1">
                                  <Badge className={getEarningsBadgeColor(earnings.feeType)}>
                                    💰 Earn ₹{earnings.agentEarning}
                                  </Badge>
                                  <p className="text-xs text-green-600 font-medium">{earnings.description}</p>
                                  {earnings.deliveryFee > 0 && (
                                    <p className="text-xs text-blue-600 font-medium">+ ₹{earnings.deliveryFee} delivery fee</p>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Items ({order.orderItems.length})</p>
                            <div className="text-sm text-gray-600">
                              {order.orderItems.map((item, itemIndex) => (
                                <span key={itemIndex} className="inline-block mr-2 mb-1">
                                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                    {item.quantity}x {item.product.name}
                                  </Badge>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-3"
                        onClick={() => claimOrder(order.id)}
                      >
                        <Package className="h-5 w-5 mr-2" />
                        {(() => {
                          const earnings = calculateDeliveryEarnings(order.total)
                          return `Claim Order - Earn ₹${earnings.agentEarning}`
                        })()}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
