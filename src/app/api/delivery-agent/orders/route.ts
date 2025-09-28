import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Get available orders for delivery agents in the same state
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { deliveryAgentId: string }
    
    // Get the delivery agent's state
    const deliveryAgent = await prisma.deliveryAgent.findUnique({
      where: { id: decoded.deliveryAgentId },
      select: { state: true, city: true }
    })

    if (!deliveryAgent) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }

    // Get two types of orders:
    // 1. Orders assigned to this agent
    // 2. Available orders in the same state (PROCESSING status, no agent assigned)
    
    const [assignedOrders, availableOrders] = await Promise.all([
      // Orders assigned to this delivery agent
      prisma.order.findMany({
        where: {
          deliveryAgentId: decoded.deliveryAgentId,
          status: {
            in: [OrderStatus.ASSIGNED, OrderStatus.SHIPPED]
          }
        },
        include: {
          buyer: { 
            select: { 
              name: true, 
              email: true,
              state: true,
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
      }),

      // Available orders in the same state that are not assigned
      prisma.order.findMany({
        where: {
          status: OrderStatus.PROCESSING,
          deliveryAgentId: null,
          buyer: {
            state: {
              equals: deliveryAgent.state
            }
          }
        },
        include: {
          buyer: { 
            select: { 
              name: true, 
              email: true,
              state: true,
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
    ])

    return NextResponse.json({ 
      assignedOrders, 
      availableOrders,
      agentState: deliveryAgent.state,
      agentCity: deliveryAgent.city
    }, { status: 200 })

  } catch (error) {
    console.error('Get delivery agent orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Claim an available order
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { deliveryAgentId: string }
    
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if order is still available (PROCESSING status, no agent assigned)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { state: true, city: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'PROCESSING') {
      return NextResponse.json({ error: 'Order is no longer available' }, { status: 400 })
    }

    if (order.deliveryAgentId) {
      return NextResponse.json({ error: 'Order already claimed by another agent' }, { status: 400 })
    }

    // Verify agent is in the same state
    const agent = await prisma.deliveryAgent.findUnique({
      where: { id: decoded.deliveryAgentId },
      select: { 
        state: true, 
        maxDeliveries: true, 
        orders: { 
          where: { 
            status: { 
              in: ['ASSIGNED', 'SHIPPED'] 
            } 
          } 
        } 
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }

    if (!order.buyer.state || agent.state.toLowerCase() !== order.buyer.state.toLowerCase()) {
      return NextResponse.json({ error: 'Order is not in your service area' }, { status: 400 })
    }

    // Check if agent hasn't exceeded maximum deliveries
    if (agent.orders.length >= agent.maxDeliveries) {
      return NextResponse.json({ error: 'You have reached your maximum delivery capacity' }, { status: 400 })
    }

    // Claim the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryAgentId: decoded.deliveryAgentId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    })

    return NextResponse.json({
      message: 'Order claimed successfully',
      order: updatedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('Claim order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
