import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Get available orders for delivery agents (simplified version)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { deliveryAgentId: string }
      
      // Get orders that delivery agents can work with: PROCESSING (available to claim) and SHIPPED (in transit)
      const availableOrders = await prisma.order.findMany({
        where: {
          status: 'PROCESSING'
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

      // Get orders currently handled by delivery agents (SHIPPED status)
      const activeOrders = await prisma.order.findMany({
        where: {
          status: 'SHIPPED'
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

      return NextResponse.json({ 
        assignedOrders: activeOrders, // SHIPPED orders that delivery agents are handling
        availableOrders: availableOrders, // PROCESSING orders available to claim
        agentId: decoded.deliveryAgentId,
        debug: {
          totalProcessing: availableOrders.length,
          totalShipped: activeOrders.length,
          token: token.substring(0, 10) + '...'
        }
      }, { status: 200 })

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Get delivery agent orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Claim an available order (simplified version)
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

    // Update order to assign it to the delivery agent and change status to SHIPPED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        // Use the actual field name from runtime
        deliveryAgentId: decoded.deliveryAgentId,
        status: 'SHIPPED',
        shippedAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      } as any // Type assertion to bypass TypeScript issues
    })

    return NextResponse.json({
      message: 'Order claimed successfully',
      order: updatedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('Claim order error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
