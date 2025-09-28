import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Auto-assign orders that have been unclaimed for too long
export async function POST(request: NextRequest) {
  try {
    const { timeoutMinutes = 30 } = await request.json()
    
    // Calculate cutoff time (orders older than X minutes without assignment)
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000)
    
    // Find orders that are PROCESSING, unassigned, and older than timeout
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PROCESSING',
        deliveryAgentId: null,
        processingAt: {
          lt: cutoffTime
        }
      },
      include: {
        buyer: {
          select: {
            name: true,
            city: true,
            state: true
          }
        }
      }
    })

    if (expiredOrders.length === 0) {
      return NextResponse.json({
        message: 'No expired orders found',
        processedOrders: 0
      }, { status: 200 })
    }

    let assignedCount = 0
    const assignments = []

    for (const order of expiredOrders) {
      // Find available delivery agents in the same state as the buyer
      const availableAgents = await prisma.deliveryAgent.findMany({
        where: {
          state: order.buyer.state || undefined,
          isActive: true,
          isAvailable: true
        },
        include: {
          orders: {
            where: {
              status: {
                in: ['ASSIGNED', 'SHIPPED']
              }
            }
          }
        }
      })

      if (availableAgents.length === 0) {
        console.log(`No available delivery agents found for state: ${order.buyer.state}`)
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
        console.log(`All agents in ${order.buyer.state} have reached maximum delivery capacity`)
        continue
      }

      // Auto-assign the order to the selected agent
      await prisma.order.update({
        where: { id: order.id },
        data: {
          deliveryAgentId: agentWithLeastDeliveries.id,
          status: 'ASSIGNED',
          assignedAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          deliveryNotes: `Auto-assigned after ${timeoutMinutes} minutes timeout`
        }
      })

      assignedCount++
      assignments.push({
        orderId: order.id,
        buyerCity: order.buyer.city,
        buyerState: order.buyer.state,
        buyerName: order.buyer.name,
        agentName: agentWithLeastDeliveries.name,
        agentId: agentWithLeastDeliveries.id,
        timeoutMinutes
      })

      console.log(`Order ${order.id} auto-assigned to ${agentWithLeastDeliveries.name} in ${order.buyer.state} after ${timeoutMinutes} minutes`)
    }

    return NextResponse.json({
      message: `Auto-assigned ${assignedCount} orders after ${timeoutMinutes} minute timeout`,
      assignments,
      totalExpired: expiredOrders.length,
      totalAssigned: assignedCount
    }, { status: 200 })

  } catch (error) {
    console.error('Auto-assign expired orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Check how many orders are eligible for auto-assignment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeoutMinutes = parseInt(searchParams.get('timeout') || '30')
    
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000)
    
    const expiredCount = await prisma.order.count({
      where: {
        status: 'PROCESSING',
        deliveryAgentId: null,
        processingAt: {
          lt: cutoffTime
        }
      }
    })

    const availableCount = await prisma.order.count({
      where: {
        status: 'PROCESSING',
        deliveryAgentId: null
      }
    })

    const activeAgents = await prisma.deliveryAgent.count({
      where: {
        isActive: true,
        isAvailable: true
      }
    })

    return NextResponse.json({
      expiredOrders: expiredCount,
      totalAvailableOrders: availableCount,
      activeAgents,
      timeoutMinutes
    }, { status: 200 })

  } catch (error) {
    console.error('Get auto-assignment stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
