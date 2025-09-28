import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      state,
      zipCodes,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      address
    } = await request.json()

    // Validate required fields
    const requiredFields = {
      name, email, password, phone, city, state, 
      zipCodes, vehicleType, vehicleNumber, licenseNumber
    }

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate phone number (basic validation)
    if (phone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }

    // Check if delivery agent already exists
    const existingAgent = await prisma.deliveryAgent.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingAgent) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new delivery agent
    const newAgent = await prisma.deliveryAgent.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCodes: zipCodes.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        address: address?.trim() || '',
        isActive: true,
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        vehicleType: true,
        isActive: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Delivery agent account created successfully',
        agent: newAgent
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Delivery agent registration error:', error)
    
    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
