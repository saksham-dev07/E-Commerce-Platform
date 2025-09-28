import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  console.log('Token from cookie:', token ? 'Token exists' : 'No token found')

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    console.log('Decoded token:', { userId: decoded.userId, role: decoded.role })
    return decoded
  } catch (error) {
    console.log('Token verification failed:', error)
    return null
  }
}

// GET - Fetch products (for buyers - all products, for sellers - their products)
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    let products: any[]

    if (sellerId) {
      if (user?.role === 'SELLER' && user?.userId === sellerId) {
        // Seller viewing their own products
        products = await prisma.product.findMany({
          where: { sellerId },
          include: { seller: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        })
      } else if (user?.role === 'SELLER') {
        // Seller trying to view another seller's products - return empty
        products = []
      } else {
        // Not authenticated or not a seller - show all public products
        products = await prisma.product.findMany({
          where: { inStock: true },
          include: { seller: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        })
      }
    } else {
      // No sellerId specified - show all public products
      products = await prisma.product.findMany({
        where: { inStock: true },
        include: { seller: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ products }, { status: 200 })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create product (sellers only)
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)

    if (!user || user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Unauthorized - Sellers only' },
        { status: 401 }
      )
    }

    console.log('Creating product for user:', user.userId, 'role:', user.role)

    // Verify the seller exists in the database
    const existingSeller = await prisma.seller.findUnique({
      where: { id: user.userId }
    })

    if (!existingSeller) {
      console.error('Seller not found in database:', user.userId)
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    console.log('Seller found in database:', existingSeller.id, existingSeller.email)

    const { name, description, price, imageUrl, category, condition, brand, weight, dimensions, tags, inStock, quantity } = await request.json()

    // Validate input
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    console.log('Creating product with data:', { 
      name, 
      price, 
      category, 
      condition, 
      brand, 
      weight, 
      dimensions, 
      tags, 
      inStock, 
      quantity, 
      sellerId: user.userId 
    })

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        category,
        condition: condition || 'New',
        brand: brand || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
        inStock: inStock !== undefined ? inStock : true,
        quantity: quantity ? parseInt(quantity) : null,
        sellerId: user.userId
      },
      include: { seller: { select: { name: true } } }
    })

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
