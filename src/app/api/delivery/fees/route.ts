import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Calculate delivery earnings based on order value
function calculateDeliveryEarnings(orderTotal: number) {
  if (orderTotal < 500) {
    // For orders below ₹500, charge ₹40 delivery fee + ₹25 agent commission
    return {
      deliveryFee: 40,
      agentEarning: 65, // ₹40 delivery fee + ₹25 base commission
      feeType: 'standard',
      description: 'Delivery Fee + Commission'
    }
  } else if (orderTotal >= 500 && orderTotal < 1000) {
    // For orders ₹500-999, free delivery but ₹35 agent commission
    return {
      deliveryFee: 0,
      agentEarning: 35,
      feeType: 'free_delivery',
      description: 'Free Delivery Commission'
    }
  } else if (orderTotal >= 1000 && orderTotal < 2000) {
    // For orders ₹1000-1999, free delivery + ₹50 premium commission
    return {
      deliveryFee: 0,
      agentEarning: 50,
      feeType: 'premium',
      description: 'Premium Order Commission'
    }
  } else {
    // For orders ₹2000+, free delivery + ₹75 high-value commission
    return {
      deliveryFee: 0,
      agentEarning: 75,
      feeType: 'high_value',
      description: 'High-Value Order Commission'
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const earnings = calculateDeliveryEarnings(order.total)

    return NextResponse.json({
      orderId,
      orderTotal: order.total,
      earnings
    })

  } catch (error) {
    console.error('Get delivery earnings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true,
        total: true,
        // deliveryFee: true (if this field exists in your schema)
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const earnings = calculateDeliveryEarnings(order.total)

    // Update the order with delivery fee information
    // Note: You may need to add deliveryFee and agentEarning fields to your Order schema
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        // deliveryFee: earnings.deliveryFee,
        // agentEarning: earnings.agentEarning,
        // You can store this in the order notes or a separate field
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Delivery fee calculated and applied',
      order: updatedOrder,
      earnings
    })

  } catch (error) {
    console.error('Apply delivery fee error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
