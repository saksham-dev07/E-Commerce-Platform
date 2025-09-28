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

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: user.userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                seller: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders }, { status: 200 })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create order from cart
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const { shippingAddress } = await request.json()

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Get all cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: { buyerId: user.userId },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate total including delivery charges
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const deliveryFee = subtotal >= 500 ? 0 : 65 // Free delivery for orders ₹500 and above
    const total = subtotal + deliveryFee

    // Create order with order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: user.userId,
          total: parseFloat(total.toFixed(2)),
          status: 'PENDING',
          shippingAddress
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(cartItem =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItem.product.price
            }
          })
        )
      )

      // Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { buyerId: user.userId }
      })

      return { ...newOrder, orderItems }
    })

    return NextResponse.json({
      message: 'Order created successfully',
      order
    }, { status: 201 })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
