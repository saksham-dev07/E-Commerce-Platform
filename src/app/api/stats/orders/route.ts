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

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      // Return general stats for non-authenticated users
      const count = await prisma.order.count()
      return NextResponse.json({ count }, { status: 200 })
    }

    if (user.role === 'SELLER') {
      // Return seller-specific order stats
      const orders = await prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              product: true
            },
            where: {
              product: {
                sellerId: user.userId
              }
            }
          }
        },
        where: {
          orderItems: {
            some: {
              product: {
                sellerId: user.userId
              }
            }
          }
        }
      })

      // Calculate seller revenue from completed orders
      const revenue = orders
        .filter(order => order.status === 'DELIVERED')
        .reduce((total, order) => {
          const sellerItemsTotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          return total + sellerItemsTotal
        }, 0)

      const pendingOrders = orders.filter(order => order.status === 'PENDING').length
      const completedOrders = orders.filter(order => order.status === 'DELIVERED').length

      return NextResponse.json({ 
        count: orders.length,
        revenue: revenue,
        pendingOrders,
        completedOrders
      }, { status: 200 })
    } else {
      // Return buyer-specific stats
      const buyerOrders = await prisma.order.findMany({
        where: { buyerId: user.userId }
      })

      return NextResponse.json({ 
        count: buyerOrders.length 
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
