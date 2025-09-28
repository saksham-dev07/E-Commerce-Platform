import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'
import { createNotification } from '../../notifications/route'

const prisma = new PrismaClient()

// GET - Get orders ready for delivery (PROCESSING status, unassigned)
export async function GET(request: NextRequest) {
  try {
    // Get all orders with PROCESSING status that don't have a delivery agent assigned yet
    const readyOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PROCESSING,
        deliveryAgentId: null
      },
      include: {
        buyer: { 
          select: { 
            name: true, 
            email: true,
            city: true
          } 
        },
        orderItems: {
          include: {
            product: {
              include: {
                seller: { 
                  select: { 
                    name: true 
                  } 
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders: readyOrders }, { status: 200 })

  } catch (error) {
    console.error('Get delivery orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update order status (PROCESSING → SHIPPED or SHIPPED → DELIVERED)
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !['SHIPPED', 'DELIVERED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order ID or status. Only SHIPPED or DELIVERED status allowed.' },
        { status: 400 }
      )
    }

    // Verify the order exists and is in correct status for transition
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: {
          in: status === 'SHIPPED' ? ['PROCESSING'] : ['SHIPPED']
        }
      }
    })

    if (!order) {
      const expectedStatus = status === 'SHIPPED' ? 'PROCESSING' : 'SHIPPED'
      return NextResponse.json(
        { error: `Order not found or not in ${expectedStatus} status` },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      },
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

    const actionMessage = status === 'SHIPPED' ? 'marked as shipped' : 'marked as delivered'
    return NextResponse.json({
      message: `Order ${actionMessage} successfully`,
      order: updatedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('Update delivery status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getOrderNotificationTitle(status: string): string {
  switch (status) {
    case 'SHIPPED': return 'Order Shipped'
    case 'DELIVERED': return 'Order Delivered'
    default: return 'Order Update'
  }
}

function getOrderNotificationMessage(status: string, orderId: string): string {
  const orderRef = `#${orderId.slice(-8)}`
  switch (status) {
    case 'SHIPPED': return `Your order ${orderRef} is on its way! Our delivery partner will contact you soon.`
    case 'DELIVERED': return `Your order ${orderRef} has been delivered successfully. Thank you for shopping with us!`
    default: return `Your order ${orderRef} status has been updated.`
  }
}
