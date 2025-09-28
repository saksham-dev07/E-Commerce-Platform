import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
  } catch {
    return null
  }
}

// Helper function to create notification
export async function createNotification(
  userId: string, 
  type: string, 
  title: string, 
  message: string, 
  orderId?: string
) {
  try {
    // In a real app, you'd have a Notification model
    // For now, we'll store notifications in a simple way
    console.log(`Notification for user ${userId}: ${title} - ${message}`)
    
    // You could implement email/SMS notifications here
    // or store in a database table for notifications
    
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

// GET - Get notifications for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For demo purposes, we'll return recent orders as notifications
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let notifications: any[] = []

    if (user.role === 'BUYER') {
      // Get buyer's recent orders as notifications
      const orders = await prisma.order.findMany({
        where: {
          buyerId: user.userId,
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })

      notifications = orders.map(order => ({
        id: order.id,
        type: 'ORDER_UPDATE',
        title: getOrderNotificationTitle(order.status),
        message: getOrderNotificationMessage(order.status, order.id),
        status: order.status,
        createdAt: order.updatedAt,
        orderId: order.id,
        isRead: false // Will be determined on client side
      }))

      // Only return notifications if there are actual orders
      if (notifications.length === 0) {
        return NextResponse.json({ 
          notifications: [],
          unreadCount: 0
        }, { status: 200 })
      }
    }

    return NextResponse.json({ 
      notifications,
      unreadCount: notifications.length // Will be calculated on client side
    }, { status: 200 })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, we'll just mark all notifications as "read" by storing the read timestamp
    // In a real application, you'd have a proper notification table
    const readTimestamp = new Date().toISOString()
    
    // Store the read timestamp in localStorage or session on client side
    // For this demo, we'll just return success
    // The actual read state will be managed on the client side
    
    return NextResponse.json({ 
      success: true,
      readTimestamp 
    }, { status: 200 })

  } catch (error) {
    console.error('Mark notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getOrderNotificationTitle(status: string): string {
  switch (status) {
    case 'PENDING': return 'Order Placed Successfully'
    case 'PROCESSING': return 'Order Confirmed'
    case 'SHIPPED': return 'Order Shipped'
    case 'DELIVERED': return 'Order Delivered'
    case 'CANCELLED': return 'Order Cancelled'
    default: return 'Order Update'
  }
}

function getOrderNotificationMessage(status: string, orderId: string): string {
  const orderRef = `#${orderId.slice(-8)}`
  switch (status) {
    case 'PENDING': return `Your order ${orderRef} has been placed and is waiting for seller confirmation.`
    case 'PROCESSING': return `Great news! Your order ${orderRef} has been confirmed by the seller and is being prepared.`
    case 'SHIPPED': return `Your order ${orderRef} is on its way! Our delivery partner will contact you soon.`
    case 'DELIVERED': return `Your order ${orderRef} has been delivered successfully. Thank you for shopping with us!`
    case 'CANCELLED': return `Your order ${orderRef} has been cancelled. If you have any questions, please contact support.`
    default: return `Your order ${orderRef} status has been updated.`
  }
}
