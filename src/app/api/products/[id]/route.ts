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

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { seller: { select: { name: true, email: true } } }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product }, { status: 200 })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update product (seller only - their own products)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // Check if product exists and belongs to the seller
    const existingProduct = await prisma.product.findUnique({
      where: { id: id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own products' },
        { status: 403 }
      )
    }

    const { name, description, price, imageUrl, category, inStock } = await request.json()

    const product = await prisma.product.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category && { category }),
        ...(inStock !== undefined && { inStock })
      },
      include: { seller: { select: { name: true } } }
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product
    }, { status: 200 })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product (seller only - their own products)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    // Check if product exists and belongs to the seller
    const existingProduct = await prisma.product.findUnique({
      where: { id: id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own products' },
        { status: 403 }
      )
    }

    // Check if product has order history
    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product - it has order history. Consider marking it as out of stock instead.' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
