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

// GET - Get seller analytics
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // Get timeRange from query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Calculate the date filter based on timeRange
    const now = new Date()
    let dateFilter: Date
    
    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get all orders containing seller's products within the time range
    const orders = await prisma.order.findMany({
      where: {
        AND: [
          {
            orderItems: {
              some: {
                product: {
                  sellerId: user.userId
                }
              }
            }
          },
          {
            createdAt: {
              gte: dateFilter
            }
          }
        ]
      },
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
      }
    })

    // Calculate analytics
    const totalOrders = orders.length
    const completedOrders = orders.filter(order => order.status === 'DELIVERED').length
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length
    const processingOrders = orders.filter(order => order.status === 'PROCESSING').length
    const shippedOrders = orders.filter(order => order.status === 'SHIPPED').length
    const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length

    // Calculate revenue (only from delivered orders)
    const totalRevenue = orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => {
        const sellerItemsTotal = order.orderItems.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        )
        return sum + sellerItemsTotal
      }, 0)

    // Calculate potential revenue (all non-cancelled orders)
    const potentialRevenue = orders
      .filter(order => order.status !== 'CANCELLED')
      .reduce((sum, order) => {
        const sellerItemsTotal = order.orderItems.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        )
        return sum + sellerItemsTotal
      }, 0)

    // Get monthly revenue (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthOrders = orders.filter(order => 
        order.status === 'DELIVERED' &&
        order.updatedAt >= monthStart &&
        order.updatedAt <= monthEnd
      )

      const monthRevenue = monthOrders.reduce((sum, order) => {
        const sellerItemsTotal = order.orderItems.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        )
        return sum + sellerItemsTotal
      }, 0)

      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      })
    }

    // Top selling products
    const productSales = new Map()
    orders.forEach(order => {
      if (order.status === 'DELIVERED') {
        order.orderItems.forEach(item => {
          const productId = item.product.id
          if (productSales.has(productId)) {
            const existing = productSales.get(productId)
            productSales.set(productId, {
              ...existing,
              quantity: existing.quantity + item.quantity,
              revenue: existing.revenue + (item.price * item.quantity)
            })
          } else {
            productSales.set(productId, {
              id: productId,
              name: item.product.name,
              quantity: item.quantity,
              revenue: item.price * item.quantity,
              price: item.product.price
            })
          }
        })
      }
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      analytics: {
        totalOrders,
        completedOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        cancelledOrders,
        totalRevenue,
        potentialRevenue,
        conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0
      },
      monthlyRevenue,
      topProducts
    }, { status: 200 })

  } catch (error) {
    console.error('Get seller analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
