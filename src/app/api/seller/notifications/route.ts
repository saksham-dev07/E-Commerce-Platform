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

// GET - Get notifications for seller
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // Get recent orders for seller's products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        orderItems: {
          some: {
            product: {
              sellerId: user.userId
            }
          }
        }
      },
      include: {
        buyer: { select: { name: true } },
        orderItems: {
          include: {
            product: true
          },
          where: {
            product: {
              sellerId: user.userId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Format notifications
    const notifications = recentOrders.map(order => {
      const sellerItems = order.orderItems
      const total = sellerItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      
      return {
        id: order.id,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: `${order.buyer.name} ordered ${sellerItems.length} item(s) worth ₹${total.toFixed(2)}`,
        status: order.status,
        createdAt: order.createdAt,
        orderId: order.id,
        isRead: false // Will be determined on client side
      }
    })

    // Count pending orders (these are always important)
    const pendingCount = recentOrders.filter(order => order.status === 'PENDING').length

    // Only return notifications if there are actual orders
    if (notifications.length === 0) {
      return NextResponse.json({ 
        notifications: [],
        pendingCount: 0,
        unreadCount: 0,
        totalCount: 0
      }, { status: 200 })
    }

    return NextResponse.json({ 
      notifications,
      pendingCount,
      unreadCount: notifications.length, // Will be calculated on client side
      totalCount: notifications.length
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

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // For now, we'll just mark all notifications as "read" by storing the read timestamp
    // In a real application, you'd have a proper notification table
    const readTimestamp = new Date().toISOString()
    
    // Store the read timestamp for seller notifications
    // For this demo, we'll just return success
    // The actual read state will be managed on the client side
    
    return NextResponse.json({ 
      success: true,
      readTimestamp 
    }, { status: 200 })

  } catch (error) {
    console.error('Mark seller notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
