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

// GET - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { buyerId: user.userId },
      include: {
        product: {
          include: {
            seller: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

    return NextResponse.json({ 
      cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    }, { status: 200 })

  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.inStock) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 404 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: user.userId,
          productId
        }
      }
    })

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: {
            include: {
              seller: { select: { name: true } }
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Cart updated successfully',
        cartItem: updatedCartItem
      }, { status: 200 })
    } else {
      // Create new cart item
      const newCartItem = await prisma.cartItem.create({
        data: {
          buyerId: user.userId,
          productId,
          quantity
        },
        include: {
          product: {
            include: {
              seller: { select: { name: true } }
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Added to cart successfully',
        cartItem: newCartItem
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
