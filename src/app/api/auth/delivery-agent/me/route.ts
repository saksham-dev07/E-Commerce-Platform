import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { deliveryAgentId: string }
    
    const deliveryAgent = await prisma.deliveryAgent.findUnique({
      where: { id: decoded.deliveryAgentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        vehicleType: true,
        vehicleNumber: true,
        isActive: true,
        isAvailable: true
      }
    })

    if (!deliveryAgent) {
      return NextResponse.json({ error: 'Delivery agent not found' }, { status: 404 })
    }

    return NextResponse.json({ deliveryAgent }, { status: 200 })

  } catch (error) {
    console.error('Get delivery agent profile error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
