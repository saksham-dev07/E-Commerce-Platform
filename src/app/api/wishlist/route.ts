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

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
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

    return NextResponse.json({ 
      wishlistItems,
      itemCount: wishlistItems.length
    }, { status: 200 })

  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: user.userId,
          productId
        }
      }
    })

    if (existingWishlistItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      )
    }

    // Create new wishlist item
    const newWishlistItem = await prisma.wishlistItem.create({
      data: {
        buyerId: user.userId,
        productId
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
      message: 'Added to wishlist successfully',
      wishlistItem: newWishlistItem
    }, { status: 201 })

  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Unauthorized - Buyers only' },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the wishlist item
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: user.userId,
          productId
        }
      }
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id }
    })

    return NextResponse.json({
      message: 'Removed from wishlist successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
