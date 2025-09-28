import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Assign orders to delivery agents based on city matching
export async function POST(request: NextRequest) {
  try {
    // Get all PROCESSING orders that don't have a delivery agent yet
    const unassignedOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PROCESSING,
        deliveryAgentId: null
      },
      include: {
        buyer: {
          select: {
            city: true,
            name: true
          }
        }
      }
    })

    if (unassignedOrders.length === 0) {
      return NextResponse.json(
        { message: 'No orders available for assignment' },
        { status: 200 }
      )
    }

    let assignedCount = 0
    const assignments = []

    for (const order of unassignedOrders) {
      // Find available delivery agents in the same city as the buyer
      const availableAgents = await prisma.deliveryAgent.findMany({
        where: {
          city: order.buyer.city || undefined,
          isActive: true,
          isAvailable: true
        },
        include: {
          orders: {
            where: {
              status: {
                in: [OrderStatus.ASSIGNED, OrderStatus.SHIPPED]
              }
            }
          }
        }
      })

      if (availableAgents.length === 0) {
        console.log(`No available delivery agents found for city: ${order.buyer.city}`)
        continue
      }

      // Find the agent with the least current deliveries
      const agentWithLeastDeliveries = availableAgents.reduce((best, current) => {
        const currentDeliveries = (current as any).orders.length
        const bestDeliveries = (best as any).orders.length
        
        if (currentDeliveries < bestDeliveries) {
          return current
        } else if (currentDeliveries === bestDeliveries) {
          // If same number of deliveries, prefer the one who registered earlier
          return current.createdAt < best.createdAt ? current : best
        }
        return best
      })

      // Check if agent hasn't exceeded max deliveries
      if ((agentWithLeastDeliveries as any).orders.length >= agentWithLeastDeliveries.maxDeliveries) {
        console.log(`All agents in ${order.buyer.city} have reached maximum delivery capacity`)
        continue
      }

      // Assign the order to the selected agent
      await prisma.order.update({
        where: { id: order.id },
        data: {
          deliveryAgentId: agentWithLeastDeliveries.id,
          status: OrderStatus.ASSIGNED,
          assignedAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      })

      assignedCount++
      assignments.push({
        orderId: order.id,
        buyerCity: order.buyer.city,
        buyerName: order.buyer.name,
        agentName: agentWithLeastDeliveries.name,
        agentId: agentWithLeastDeliveries.id
      })

      console.log(`Order ${order.id} assigned to ${agentWithLeastDeliveries.name} in ${order.buyer.city}`)
    }

    return NextResponse.json({
      message: `Successfully assigned ${assignedCount} orders`,
      assignments,
      totalUnassigned: unassignedOrders.length,
      totalAssigned: assignedCount
    }, { status: 200 })

  } catch (error) {
    console.error('Auto-assign delivery agents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check assignment status
export async function GET(request: NextRequest) {
  try {
    const stats = await prisma.$transaction([
      // Count unassigned orders
      prisma.order.count({
        where: {
          status: OrderStatus.PROCESSING,
          deliveryAgentId: null
        }
      }),
      // Count assigned orders
      prisma.order.count({
        where: {
          status: OrderStatus.ASSIGNED
        }
      }),
      // Count active delivery agents
      prisma.deliveryAgent.count({
        where: {
          isActive: true,
          isAvailable: true
        }
      })
    ])

    return NextResponse.json({
      unassignedOrders: stats[0],
      assignedOrders: stats[1],
      availableAgents: stats[2]
    }, { status: 200 })

  } catch (error) {
    console.error('Get assignment stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
