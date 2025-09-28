'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { useToast } from '../../../components/ui/use-toast'
import { useNotifications } from '../../../hooks/useNotifications'
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  LogOut,
  Settings,
  DollarSign,
  Target,
  Bell
} from 'lucide-react'

interface DeliveryAgent {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  vehicleType: string
  isActive: boolean
  isAvailable: boolean
}

interface Order {
  id: string
  status: string
  total: number
  shippingAddress: string
  createdAt: string
  assignedAt?: string
  estimatedDelivery?: string
  buyer: {
    name: string
    email: string
  }
  orderItems: Array<{
    id: string
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

interface DashboardStats {
  totalAssigned: number
  totalDelivered: number
  todayDeliveries: number
  pendingDeliveries: number
}

export default function DeliveryAgentDashboard() {
  const [agent, setAgent] = useState<DeliveryAgent | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalAssigned: 0,
    totalDelivered: 0,
    todayDeliveries: 0,
    pendingDeliveries: 0
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { success, error, warning, info } = useToast()
  const { notifications, unreadCount, showOrderNotification, showDeliveryNotification, markAsRead } = useNotifications('delivery-agent')

  useEffect(() => {
    // Check if agent is logged in with JWT token
    const token = localStorage.getItem('deliveryAgentToken')
    if (!token) {
      router.push('/auth/delivery-agent')
      return
    }

    fetchAgentData(token)
    fetchAssignedOrders(token)
    fetchStats(token)
  }, [router])

  // Handle click outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const fetchAgentData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/delivery-agent/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAgent(data.deliveryAgent)
      } else {
        router.push('/auth/delivery-agent')
      }
    } catch (error) {
      console.error('Failed to fetch agent data:', error)
      router.push('/auth/delivery-agent')
    }
  }

  const fetchAssignedOrders = async (token: string) => {
    try {
      const response = await fetch(`/api/delivery-agent/orders-temp`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Orders data:', data)
        setOrders([...data.assignedOrders, ...data.availableOrders])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const fetchStats = async (token: string) => {
    try {
      // For now, calculate stats from orders
      setStats({
        totalAssigned: orders.filter(o => o.status === 'PROCESSING').length,
        totalDelivered: orders.filter(o => o.status === 'DELIVERED').length,
        todayDeliveries: orders.filter(o => {
          const today = new Date().toDateString()
          return o.status === 'DELIVERED' && new Date(o.createdAt).toDateString() === today
        }).length,
        pendingDeliveries: orders.filter(o => ['PROCESSING', 'SHIPPED'].includes(o.status)).length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus
        })
      })

      if (response.ok) {
        // Update the orders list locally
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
        
        // Refresh stats
        const token = localStorage.getItem('deliveryAgentToken')
        if (token) {
          await fetchStats(token)
        }
        showOrderNotification({ id: orderId }, newStatus)
      } else {
        const data = await response.json()
        error('Update Failed', data.error || 'Failed to update order status')
      }
    } catch (err) {
      error('Update Error', 'An error occurred while updating order status')
    } finally {
      setUpdating(null)
    }
  }

  const toggleAvailability = async () => {
    if (!agent) return

    try {
      const token = localStorage.getItem('deliveryAgentToken')
      const response = await fetch('/api/delivery-agent/toggle-availability', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ agentId: agent.id })
      })

      if (response.ok) {
        const data = await response.json()
        setAgent({ ...agent, isAvailable: data.isAvailable })
        showDeliveryNotification(
          `You are now ${data.isAvailable ? 'available' : 'unavailable'} for deliveries`,
          'success'
        )
      } else {
        error('Update Failed', 'Failed to update availability status')
      }
    } catch (err) {
      error('Update Error', 'An error occurred while updating availability')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('deliveryAgent')
    localStorage.removeItem('deliveryAgentToken')
    router.push('/auth/delivery-agent')
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
        showDeliveryNotification('Order claimed successfully!', 'success')
        // Refresh data
        if (token) {
          await fetchAssignedOrders(token)
          await fetchStats(token)
        }
      } else {
        const errorData = await response.json()
        error('Claim Failed', errorData.error || 'Failed to claim order')
      }
    } catch (err) {
      console.error('Error claiming order:', err)
      error('Claim Error', 'An error occurred while claiming the order')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PROCESSING': return 'SHIPPED'
      case 'SHIPPED': return 'DELIVERED'
      default: return null
    }
  }

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PROCESSING': return 'Mark as Shipped'
      case 'SHIPPED': return 'Mark as Delivered'
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Please login to access dashboard</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Delivery Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {agent.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  title="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead()}
                          >
                            Mark all read
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Badge className={agent.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {agent.isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAvailability}
              >
                {agent.isAvailable ? 'Go Offline' : 'Go Online'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assigned</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalDelivered}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Deliveries</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayDeliveries}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingDeliveries}</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Assigned Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders assigned yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  {agent.isAvailable ? 'You are available for new deliveries' : 'Go online to receive new orders'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{order.buyer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{order.shippingAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {getNextStatus(order.status) && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            disabled={updating === order.id}
                            className="mb-2"
                          >
                            {updating === order.id ? 'Updating...' : getStatusAction(order.status)}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
