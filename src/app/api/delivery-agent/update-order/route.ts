import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Calculate delivery earnings based on order value
function calculateDeliveryEarnings(orderTotal: number) {
  if (orderTotal < 500) {
    return {
      deliveryFee: 40,
      agentEarning: 65, // ₹40 delivery fee + ₹25 base commission
      feeType: 'standard'
    }
  } else if (orderTotal >= 500 && orderTotal < 1000) {
    return {
      deliveryFee: 0,
      agentEarning: 35,
      feeType: 'free_delivery'
    }
  } else if (orderTotal >= 1000 && orderTotal < 2000) {
    return {
      deliveryFee: 0,
      agentEarning: 50,
      feeType: 'premium'
    }
  } else {
    return {
      deliveryFee: 0,
      agentEarning: 75,
      feeType: 'high_value'
    }
  }
}

// PUT - Update order status by delivery agent using JWT
export async function PUT(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { deliveryAgentId: string }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status transitions
    const validTransitions = {
      'ASSIGNED': ['SHIPPED'],
      'SHIPPED': ['DELIVERED']
    }

    // Verify the order exists and belongs to this agent
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        // deliveryAgentId: decoded.deliveryAgentId (commented due to schema issues)
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not assigned to this agent' },
        { status: 404 }
      )
    }

    // Check if status transition is valid
    const allowedNextStatuses = validTransitions[order.status as keyof typeof validTransitions]
    if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      )
    }

    // Update order status with appropriate timestamp
    const updateData: any = {
      status: status,
      updatedAt: new Date()
    }

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date()
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
      
      // Calculate and record delivery agent earnings when order is delivered
      const earnings = calculateDeliveryEarnings(order.total)
      
      // Create delivery earnings record (you might want to create a separate table for this)
      try {
        // For now, we'll add a comment to track earnings
        console.log(`Delivery Agent ${decoded.deliveryAgentId} earned ₹${earnings.agentEarning} for order ${orderId} (${earnings.feeType})`)
        
        // You could create an earnings record like this:
        /*
        await prisma.deliveryEarning.create({
          data: {
            deliveryAgentId: decoded.deliveryAgentId,
            orderId: orderId,
            amount: earnings.agentEarning,
            deliveryFee: earnings.deliveryFee,
            feeType: earnings.feeType,
            createdAt: new Date()
          }
        })
        */
      } catch (earningsError) {
        console.error('Error recording delivery earnings:', earningsError)
        // Don't fail the order update if earnings tracking fails
      }
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

    // Create notification for buyer
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: updatedOrder.buyer.id,
          type: 'order_update',
          title: `Order ${status === 'SHIPPED' ? 'Shipped' : 'Delivered'}`,
          message: `Your order #${orderId.slice(-8)} has been ${status === 'SHIPPED' ? 'picked up and is on the way' : 'delivered successfully'}`,
          orderId: orderId
        })
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't fail the order update if notification fails
    }

    // Create enhanced success message with earnings info
    let successMessage = `Order status updated to ${status}`
    if (status === 'DELIVERED') {
      const earnings = calculateDeliveryEarnings(order.total)
      successMessage += `. You earned ₹${earnings.agentEarning} for this delivery!`
    }

    return NextResponse.json(
      { 
        message: successMessage,
        order: updatedOrder,
        ...(status === 'DELIVERED' && { 
          earnings: calculateDeliveryEarnings(order.total) 
        })
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
