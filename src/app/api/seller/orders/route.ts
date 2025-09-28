import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { createNotification } from '../../notifications/route'

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

// GET - Get orders for seller's products
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // Get all orders that contain the seller's products
    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { name: true, email: true } },
        orderItems: {
          include: {
            product: {
              include: {
                seller: { select: { id: true, name: true } }
              }
            }
          },
          where: {
            product: {
              sellerId: user.userId
            }
          }
        }
      },
      where: {
        orderItems: {
          some: {
            product: {
              sellerId: user.userId
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate seller-specific totals for each order
    const sellerOrders = orders.map(order => {
      const sellerTotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      return {
        ...order,
        sellerTotal,
        itemCount: order.orderItems.length
      }
    })

    return NextResponse.json({ orders: sellerOrders }, { status: 200 })

  } catch (error) {
    console.error('Get seller orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update order status (seller action)
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Verify the order contains the seller's products
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        orderItems: {
          some: {
            product: {
              sellerId: user.userId
            }
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update order status with proper timestamps
    const updateData: any = { 
      status: status as any,
      updatedAt: new Date()
    }

    // Set appropriate timestamp based on status
    switch (status) {
      case 'PROCESSING':
        updateData.processingAt = new Date()
        break
      case 'SHIPPED':
        updateData.shippedAt = new Date()
        break
      case 'DELIVERED':
        updateData.deliveredAt = new Date()
        break
      case 'CANCELLED':
        updateData.cancelledAt = new Date()
        break
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: {
              include: {
                seller: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    // Send notification to buyer about status change
    const notificationTitle = getOrderNotificationTitle(status)
    const notificationMessage = getOrderNotificationMessage(status, orderId)
    
    await createNotification(
      updatedOrder.buyer.id,
      'ORDER_UPDATE',
      notificationTitle,
      notificationMessage,
      orderId
    )

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getOrderNotificationTitle(status: string): string {
  switch (status) {
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
    case 'PROCESSING': return `Great news! Your order ${orderRef} has been confirmed by the seller and is being prepared.`
    case 'SHIPPED': return `Your order ${orderRef} is on its way! Our delivery partner will contact you soon.`
    case 'DELIVERED': return `Your order ${orderRef} has been delivered successfully. Thank you for shopping with us!`
    case 'CANCELLED': return `Your order ${orderRef} has been cancelled. If you have any questions, please contact support.`
    default: return `Your order ${orderRef} status has been updated.`
  }
}
