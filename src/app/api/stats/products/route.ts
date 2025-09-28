import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const count = await prisma.product.count({
      where: {
        // Only count products that are in stock
        inStock: true
      }
    })

    return NextResponse.json({ count }, { status: 200 })
  } catch (error) {
    console.error('Error fetching product stats:', error)
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
