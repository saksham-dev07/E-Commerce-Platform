import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const sellersCount = await prisma.seller.count()
    const buyersCount = await prisma.buyer.count()

    return NextResponse.json({ 
      sellersCount, 
      buyersCount,
      totalUsers: sellersCount + buyersCount
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ 
      sellersCount: 0, 
      buyersCount: 0,
      totalUsers: 0
    }, { status: 200 })
  }
}
