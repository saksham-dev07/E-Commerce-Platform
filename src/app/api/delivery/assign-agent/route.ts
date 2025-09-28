import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Function to extract city from shipping address
function extractCityFromAddress(address: string): string {
  // Simple extraction - in production, you might want to use a proper address parser
  const addressParts = address.split(',').map(part => part.trim())
  
  // Assume city is typically the second-to-last part before state/pincode
  if (addressParts.length >= 2) {
    // Try to find city (look for common patterns)
    for (let i = addressParts.length - 3; i >= 0; i--) {
      const part = addressParts[i]
      // Skip if it looks like a pincode (6 digits) or state
      if (!/^\d{6}$/.test(part) && part.length > 2) {
        return part.toLowerCase()
      }
    }
  }
  
  // Fallback to first non-empty part
  return addressParts[0]?.toLowerCase() || ''
}

// Function to find available delivery agent in the same city
async function findAvailableAgent(buyerCity: string): Promise<string | null> {
  try {
    // First, try to find agents in the exact same city
    let agents = await prisma.deliveryAgent.findMany({
      where: {
        city: {
          contains: buyerCity
        },
        isActive: true,
        isAvailable: true
      },
      select: {
        id: true,
        city: true,
        maxDeliveries: true,
        zipCodes: true,
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: [OrderStatus.ASSIGNED, OrderStatus.SHIPPED]
                }
              }
            }
          }
        }
      }
    })

    // If no agents found in the city, try broader search by state
    if (agents.length === 0) {
      agents = await prisma.deliveryAgent.findMany({
        where: {
          isActive: true,
          isAvailable: true
        },
        select: {
          id: true,
          city: true,
          maxDeliveries: true,
          zipCodes: true,
          _count: {
            select: {
              orders: {
                where: {
                  status: {
                    in: [OrderStatus.ASSIGNED, OrderStatus.SHIPPED]
                  }
                }
              }
            }
          }
        }
      })
    }

    // Filter agents who haven't reached their max deliveries
    const availableAgents = agents.filter(agent => 
      agent._count.orders < agent.maxDeliveries
    )

    if (availableAgents.length === 0) {
      return null
    }

    // Sort by least current deliveries (load balancing)
    availableAgents.sort((a, b) => a._count.orders - b._count.orders)

    return availableAgents[0].id
  } catch (error) {
    console.error('Error finding available agent:', error)
    return null
  }
}

// POST - Assign delivery agent to an order
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { id: true, name: true, city: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== OrderStatus.PROCESSING) {
      return NextResponse.json(
        { error: 'Order must be in PROCESSING status to assign delivery agent' },
        { status: 400 }
      )
    }

    // Extract city from shipping address or use buyer's city
    const buyerCity = order.buyer.city || extractCityFromAddress(order.shippingAddress)
    
    if (!buyerCity) {
      return NextResponse.json(
        { error: 'Cannot determine delivery location' },
        { status: 400 }
      )
    }

    // Find available delivery agent
    const agentId = await findAvailableAgent(buyerCity)

    if (!agentId) {
      return NextResponse.json(
        { error: 'No available delivery agents in the area' },
        { status: 404 }
      )
    }

    // Calculate estimated delivery time (3-5 days from now)
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 3)

    // Assign the delivery agent to the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryAgentId: agentId,
        status: OrderStatus.ASSIGNED,
        assignedAt: new Date(),
        estimatedDelivery,
        updatedAt: new Date()
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        deliveryAgent: { select: { name: true, phone: true } }
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
          title: 'Order Assigned for Delivery',
          message: `Your order #${orderId.slice(-8)} has been assigned to delivery agent ${updatedOrder.deliveryAgent?.name}. Expected delivery: ${estimatedDelivery.toLocaleDateString()}`,
          orderId: orderId
        })
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json(
      { 
        message: 'Delivery agent assigned successfully',
        order: updatedOrder,
        estimatedDelivery
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Assign delivery agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
