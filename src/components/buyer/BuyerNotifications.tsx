import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Bell, Package, ShoppingBag, Truck, CheckCircle, AlertCircle } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status?: string
  orderId?: string
  createdAt: string
  isRead: boolean
}

export default function BuyerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications-buyer') || '[]')
        
        // Mark notifications as read based on localStorage
        const notificationsWithReadStatus = (data.notifications || []).map((notif: any) => ({
          ...notif,
          isRead: readNotifications.includes(notif.id)
        }))
        
        setNotifications(notificationsWithReadStatus)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    setMarkingRead(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Mark all notifications as read in localStorage
        const notificationIds = notifications.map(n => n.id)
        localStorage.setItem('readNotifications-buyer', JSON.stringify(notificationIds))
        
        // Update state
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setMarkingRead(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const getNotificationIcon = (type: string, status?: string) => {
    switch (type) {
      case 'ORDER_STATUS':
        switch (status) {
          case 'PROCESSING':
            return <Package className="w-5 h-5 text-blue-600" />
          case 'SHIPPED':
            return <Truck className="w-5 h-5 text-purple-600" />
          case 'DELIVERED':
            return <CheckCircle className="w-5 h-5 text-green-600" />
          case 'CANCELLED':
            return <AlertCircle className="w-5 h-5 text-red-600" />
          default:
            return <ShoppingBag className="w-5 h-5 text-orange-600" />
        }
      case 'ORDER_CONFIRMATION':
        return <ShoppingBag className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading notifications...</p>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Notifications</CardTitle>
                <CardDescription>
                  Stay updated with your orders and account activity
                </CardDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center space-x-4">
                <Badge variant="default" className="bg-blue-600">
                  {unreadCount} unread
                </Badge>
                <Button 
                  onClick={markAllAsRead}
                  disabled={markingRead}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark all as read
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications yet</h3>
            <p className="text-gray-500">When you place orders or there are updates, you'll see them here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${
                !notification.isRead ? 'ring-2 ring-blue-200 bg-blue-50' : 'bg-white'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      notification.status ? getStatusColor(notification.status) : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type, notification.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-blue-600">
                            New
                          </Badge>
                        )}
                        {notification.status && (
                          <Badge variant="outline" className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.orderId && (
                        <span className="text-sm font-medium text-blue-600">
                          Order #{notification.orderId.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
