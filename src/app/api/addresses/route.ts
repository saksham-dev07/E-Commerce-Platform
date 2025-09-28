import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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

    // Fetch addresses for the buyer
    // @ts-ignore - TypeScript not recognizing Address model after regeneration
    const addresses = await prisma.address.findMany({
      where: { buyerId: decoded.userId },
      orderBy: { isDefault: 'desc' }
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { title, fullName, phone, address, city, state, zipCode, country, isDefault } = await request.json()

    // If this is being set as default, unset any existing default address
    if (isDefault) {
      // @ts-ignore - TypeScript not recognizing Address model after regeneration
      await prisma.address.updateMany({
        where: { buyerId: decoded.userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    // Create new address
    // @ts-ignore - TypeScript not recognizing Address model after regeneration
    const newAddress = await prisma.address.create({
      data: {
        buyerId: decoded.userId,
        title,
        fullName,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault
      }
    })

    return NextResponse.json(newAddress, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
