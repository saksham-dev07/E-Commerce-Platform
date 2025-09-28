import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build search conditions for case-insensitive search in SQLite
    let whereConditions: any = {
      inStock: true
    }

    // For SQLite, we'll use a more complex approach to handle case-insensitive search
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim()
      whereConditions = {
        AND: [
          {
            inStock: true
          },
          {
            OR: [
              {
                name: {
                  contains: searchTerm
                }
              },
              {
                description: {
                  contains: searchTerm
                }
              },
              {
                category: {
                  contains: searchTerm
                }
              }
            ]
          }
        ]
      }
    }

    // Add category filter if provided
    if (category && category.trim().length > 0) {
      if (whereConditions.AND) {
        whereConditions.AND.push({
          category: category
        })
      } else {
        whereConditions = {
          AND: [
            whereConditions,
            {
              category: category
            }
          ]
        }
      }
    }

    // Get total count for pagination
    const totalProducts = await prisma.product.count({
      where: whereConditions
    })

    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        seller: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalProducts / limit)

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      searchQuery: query,
      category
    }, { status: 200 })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
