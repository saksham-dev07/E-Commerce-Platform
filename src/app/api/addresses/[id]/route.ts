import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.role !== 'BUYER') {
      return NextResponse.json({ message: 'Buyer access required' }, { status: 403 })
    }

    const addressId = params.id

    // Check if address belongs to the user
    // @ts-ignore - TypeScript not recognizing Address model after regeneration
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        buyerId: decoded.userId
      }
    })

    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 })
    }

    // Delete the address
    // @ts-ignore - TypeScript not recognizing Address model after regeneration
    await prisma.address.delete({
      where: { id: addressId }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
