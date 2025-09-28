"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  orderId?: string
  createdAt: string
  isRead: boolean
}

export function useNotifications(userType: 'buyer' | 'seller' | 'delivery-agent') {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { info, success, warning, error } = useToast()

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem(`${userType}Token`) || localStorage.getItem('token')
      if (!token) return

      // Use specific endpoint for delivery agents
      const endpoint = userType === 'delivery-agent' 
        ? '/api/delivery-agent/notifications' 
        : '/api/notifications'

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userType])

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    try {
      const token = localStorage.getItem(`${userType}Token`) || localStorage.getItem('token')
      if (!token) return

      // Use specific endpoint for delivery agents
      const endpoint = userType === 'delivery-agent' 
        ? '/api/delivery-agent/notifications' 
        : '/api/notifications'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notificationIds: notificationIds || notifications.map(n => n.id) 
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            !notificationIds || notificationIds.includes(notification.id) 
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => notificationIds ? Math.max(0, prev - notificationIds.length) : 0)
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }, [userType, notifications])

  const showOrderNotification = useCallback((order: any, newStatus: string) => {
    const orderRef = `#${order.id.slice(-8)}`
    
    switch (newStatus) {
      case 'PROCESSING':
        info('Order Confirmed', `Order ${orderRef} has been confirmed and is being prepared`)
        break
      case 'SHIPPED':
        success('Order Shipped', `Order ${orderRef} is on its way to the delivery address`)
        break
      case 'DELIVERED':
        success('Order Delivered', `Order ${orderRef} has been successfully delivered`)
        break
      case 'CANCELLED':
        warning('Order Cancelled', `Order ${orderRef} has been cancelled`)
        break
      default:
        info('Order Update', `Order ${orderRef} status has been updated to ${newStatus}`)
    }
  }, [info, success, warning])

  const showDeliveryNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    switch (type) {
      case 'success':
        success('Delivery Update', message)
        break
      case 'warning':
        warning('Delivery Alert', message)
        break
      case 'error':
        error('Delivery Error', message)
        break
      default:
        info('Delivery Info', message)
    }
  }, [info, success, warning, error])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications()
    
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    showOrderNotification,
    showDeliveryNotification
  }
}
