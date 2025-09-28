'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Bell, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Users,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Activity,
  Target,
  TrendingUp,
  Star,
  BarChart3
} from 'lucide-react'

interface Order {
  id: string
  status: string
  createdAt: string
  sellerTotal: number
  itemCount: number
  shippingAddress: string
  buyer: {
    name: string
    email: string
    phone?: string
    city?: string
  }
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      imageUrl?: string
    }
  }>
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: string
  createdAt: string
  orderId: string
  isRead: boolean
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
type FilterStatus = 'all' | OrderStatus

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/seller')
      return
    }
    
    if (user.role !== 'SELLER') {
      router.push('/')
      return
    }

    fetchOrders()
    fetchNotifications()
  }, [user, router])

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderItems.some(item => 
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'amount':
          aValue = a.sellerTotal
          bValue = b.sellerTotal
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter, sortBy, sortOrder])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seller/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/seller/notifications')
      if (response.ok) {
        const data = await response.json()
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications-seller') || '[]')
        
        const notificationsWithReadStatus = data.notifications.map((notification: any) => ({
          ...notification,
          isRead: readNotifications.includes(notification.id)
        }))
        
        setNotifications(notificationsWithReadStatus)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchOrders(), fetchNotifications()])
    setRefreshing(false)
  }

  // Get allowed status transitions for sellers
  const getAllowedStatusOptions = (currentStatus: string) => {
    const sellerTransitions: { [key: string]: string[] } = {
      'PENDING': ['PENDING', 'PROCESSING'],
      'PROCESSING': ['PROCESSING'], // Only processing, delivery agent handles shipping
      'SHIPPED': [], // No changes allowed for sellers
      'DELIVERED': [], // No changes allowed for sellers
      'CANCELLED': [] // No changes allowed for sellers
    }
    
    return sellerTransitions[currentStatus] || []
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PROCESSING':
        return <Package className="w-4 h-4" />
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('date')
    setSortOrder('desc')
  }

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalRevenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.sellerTotal, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Orders</h2>
          <p className="text-gray-500">Fetching your order data...</p>
        </div>
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
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold">Order Management</h1>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <Activity className="w-4 h-4 mr-1" />
                  Live
                </Badge>
              </div>
              <p className="text-blue-100 text-lg">
                Monitor and manage your {orders.length} orders with advanced tools and insights.
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
              
              <Button 
                onClick={() => setShowNotifications(!showNotifications)}
                variant="outline" 
                className="border-2 border-yellow-300 bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400 hover:text-yellow-900 backdrop-blur-sm font-semibold shadow-lg relative"
              >
                <Bell className="w-5 h-5 mr-2" />
                Notifications
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
              
              <Button variant="outline" className="border-2 border-emerald-300 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400 hover:text-emerald-900 backdrop-blur-sm font-semibold shadow-lg">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 -mt-12 relative z-10">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                <div className="text-2xl font-bold">{orderStats.total}</div>
                <div className="text-xs text-blue-200">Total Orders</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-100" />
                <div className="text-2xl font-bold">{orderStats.pending}</div>
                <div className="text-xs text-yellow-200">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                <div className="text-2xl font-bold">{orderStats.processing}</div>
                <div className="text-xs text-blue-200">Processing</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-purple-100" />
                <div className="text-2xl font-bold">{orderStats.shipped}</div>
                <div className="text-xs text-purple-200">Shipped</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-100" />
                <div className="text-2xl font-bold">{orderStats.delivered}</div>
                <div className="text-xs text-green-200">Delivered</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-100" />
                <div className="text-2xl font-bold">₹{orderStats.totalRevenue.toFixed(0)}</div>
                <div className="text-xs text-emerald-200">Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-semibold">🎛️ Order Controls</h3>
                  <p className="text-gray-600">Search, filter, and manage your orders efficiently</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                aria-label="Filter by order status"
                className="border-gray-300 focus:border-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Sort By */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                aria-label="Sort orders by"
                className="border-gray-300 focus:border-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>

              {/* Sort Order */}
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                aria-label="Sort order"
                className="border-gray-300 focus:border-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-semibold">📦 Your Orders</h3>
                  <p className="text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                {filteredOrders.length} orders
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl">
                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Your Filters'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {orders.length === 0 
                    ? 'Orders from customers will appear here once they start purchasing your products'
                    : 'Try adjusting your search criteria or filters to find orders'
                  }
                </p>
                {orders.length > 0 && (
                  <Button variant="outline" onClick={resetFilters} className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                    <Filter className="w-5 h-5 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={`border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Order #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">{order.buyer.name}</div>
                                <div className="text-sm text-gray-500">{order.buyer.email}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-purple-600" />
                              <div>
                                <div className="font-medium text-gray-900">{order.itemCount} items</div>
                                <div className="text-sm text-gray-500">In this order</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-gray-900">₹{order.sellerTotal.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">Your earnings</div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Order Items:</div>
                            <div className="space-y-1">
                              {order.orderItems.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {item.product.name} × {item.quantity}
                                  </span>
                                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              {order.orderItems.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{order.orderItems.length - 2} more items
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="w-full hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && getAllowedStatusOptions(order.status).length > 1 && (
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              disabled={updating === order.id}
                              aria-label={`Update status for order ${order.id}`}
                              className="w-full border-gray-300 focus:border-indigo-500 rounded-md px-3 py-2 bg-white text-gray-900 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {getAllowedStatusOptions(order.status).map(status => (
                                <option key={status} value={status}>
                                  {status === 'PENDING' ? 'Pending' :
                                   status === 'PROCESSING' ? 'Processing' :
                                   status === 'SHIPPED' ? 'Shipped' :
                                   status === 'DELIVERED' ? 'Delivered' :
                                   status === 'CANCELLED' ? 'Cancelled' : status}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {/* Show status if no changes allowed */}
                          {(order.status === 'DELIVERED' || order.status === 'CANCELLED' || getAllowedStatusOptions(order.status).length <= 1) && (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                              <span className="text-sm font-medium text-gray-700">
                                Status: {order.status === 'PENDING' ? 'Pending' :
                                        order.status === 'PROCESSING' ? 'Processing (Awaiting Delivery Agent)' :
                                        order.status === 'SHIPPED' ? 'Shipped' :
                                        order.status === 'DELIVERED' ? 'Delivered' :
                                        order.status === 'CANCELLED' ? 'Cancelled' : order.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">Order Details</h3>
                    <p className="text-gray-600">Order #{selectedOrder.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedOrder.buyer.name}</div>
                      <div><strong>Email:</strong> {selectedOrder.buyer.email}</div>
                      {selectedOrder.buyer.phone && (
                        <div><strong>Phone:</strong> {selectedOrder.buyer.phone}</div>
                      )}
                      {selectedOrder.buyer.city && (
                        <div><strong>City:</strong> {selectedOrder.buyer.city}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Shipping Address
                    </h4>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.shippingAddress || 'Address not provided'}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Your Total Earnings:</span>
                      <span className="font-bold text-2xl text-green-600">₹{selectedOrder.sellerTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
