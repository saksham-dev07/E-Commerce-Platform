import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Toggle delivery agent availability
export async function PUT(request: NextRequest) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Get current agent status
    const agent = await prisma.deliveryAgent.findUnique({
      where: { id: agentId },
      select: { isAvailable: true }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Delivery agent not found' },
        { status: 404 }
      )
    }

    // Toggle availability
    const updatedAgent = await prisma.deliveryAgent.update({
      where: { id: agentId },
      data: {
        isAvailable: !agent.isAvailable,
        updatedAt: new Date()
      },
      select: {
        id: true,
        isAvailable: true
      }
    })

    return NextResponse.json(
      { 
        message: `Availability ${updatedAgent.isAvailable ? 'enabled' : 'disabled'}`,
        isAvailable: updatedAgent.isAvailable
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Toggle availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
