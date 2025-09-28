import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify delivery agent JWT token
function verifyDeliveryAgentToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
  } catch {
    return null
  }
}

// GET - Get notifications for delivery agent
export async function GET(request: NextRequest) {
  try {
    const agent = verifyDeliveryAgentToken(request)

    if (!agent) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get orders assigned to this delivery agent in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orders = await prisma.order.findMany({
      where: {
        deliveryAgentId: agent.agentId,
        updatedAt: { gte: sevenDaysAgo }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    const notifications = orders.map(order => ({
      id: `order_${order.id}`,
      type: 'ORDER_UPDATE',
      title: getDeliveryNotificationTitle(order.status),
      message: getDeliveryNotificationMessage(order.status, order.id),
      status: order.status,
      createdAt: order.updatedAt,
      orderId: order.id,
      isRead: false // Will be determined on client side
    }))

    // Add availability notifications
    const recentAvailabilityChange = {
      id: 'availability_update',
      type: 'AVAILABILITY_UPDATE',
      title: 'Availability Status',
      message: 'Your availability status affects order assignments',
      createdAt: new Date().toISOString(),
      isRead: false
    }

    const allNotifications = [recentAvailabilityChange, ...notifications]

    return NextResponse.json({ 
      notifications: allNotifications,
      unreadCount: allNotifications.length
    }, { status: 200 })

  } catch (error) {
    console.error('Get delivery agent notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Mark notifications as read for delivery agent
export async function POST(request: NextRequest) {
  try {
    const agent = verifyDeliveryAgentToken(request)

    if (!agent) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationIds } = body

    // For now, we'll just return success as we don't have a notifications table
    // In a real app, you'd update the read status in the database
    const readTimestamp = new Date().toISOString()
    
    return NextResponse.json({ 
      success: true,
      readTimestamp,
      markedIds: notificationIds || []
    }, { status: 200 })

  } catch (error) {
    console.error('Mark delivery agent notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getDeliveryNotificationTitle(status: string): string {
  switch (status) {
    case 'PROCESSING': return 'New Order Assigned'
    case 'SHIPPED': return 'Order Ready for Delivery'
    case 'DELIVERED': return 'Delivery Completed'
    case 'CANCELLED': return 'Order Cancelled'
    default: return 'Order Update'
  }
}

function getDeliveryNotificationMessage(status: string, orderId: string): string {
  const orderRef = `#${orderId.slice(-8)}`
  switch (status) {
    case 'PROCESSING': return `You have been assigned order ${orderRef}. Please prepare for pickup.`
    case 'SHIPPED': return `Order ${orderRef} is ready for delivery. Please proceed to the delivery address.`
    case 'DELIVERED': return `Order ${orderRef} has been marked as delivered. Great job!`
    case 'CANCELLED': return `Order ${orderRef} has been cancelled and is no longer assigned to you.`
    default: return `Order ${orderRef} status has been updated to ${status}.`
  }
}
