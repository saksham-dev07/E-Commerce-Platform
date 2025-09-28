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

// Define allowed status transitions based on user role
const getAllowedTransitions = (userRole: string, currentStatus: string) => {
  if (userRole === 'SELLER') {
    const sellerTransitions: { [key: string]: string[] } = {
      'PENDING': ['PROCESSING'],
      'PROCESSING': [], // Sellers can't change from processing
      'SHIPPED': [],
      'DELIVERED': [],
      'CANCELLED': []
    }
    return sellerTransitions[currentStatus] || []
  }
  
  if (userRole === 'DELIVERY_AGENT') {
    const deliveryTransitions: { [key: string]: string[] } = {
      'PENDING': [],
      'PROCESSING': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': []
    }
    return deliveryTransitions[currentStatus] || []
  }
  
  return []
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)

    if (!user || !['SELLER', 'DELIVERY_AGENT'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers and Delivery Agents only' },
        { status: 401 }
      )
    }

    const { status: newStatus } = await request.json()
    const orderId = params.id

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Get the current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                seller: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this order
    if (user.role === 'SELLER') {
      const sellerIds = order.orderItems.map(item => item.product.sellerId)
      if (!sellerIds.includes(user.userId)) {
        return NextResponse.json(
          { error: 'Unauthorized - Not your order' },
          { status: 403 }
        )
      }
    }

    // Check if the status transition is allowed
    const allowedStatuses = getAllowedTransitions(user.role, order.status)
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot change status from ${order.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        // Update timestamps based on status
        ...(newStatus === 'PROCESSING' && { processingAt: new Date() }),
        ...(newStatus === 'SHIPPED' && { shippedAt: new Date() }),
        ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() })
      },
      include: {
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

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order: updatedOrder 
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
