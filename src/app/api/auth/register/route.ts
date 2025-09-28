import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['BUYER', 'SELLER'].includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid role. Must be BUYER or SELLER' },
        { status: 400 }
      )
    }

    const upperRole = role.toUpperCase()

    // Check if user already exists in the appropriate table
    let existingUser
    if (upperRole === 'BUYER') {
      existingUser = await prisma.buyer.findUnique({
        where: { email }
      })
    } else {
      existingUser = await prisma.seller.findUnique({
        where: { email }
      })
    }

    if (existingUser) {
      return NextResponse.json(
        { error: `${upperRole.toLowerCase()} with this email already exists` },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in appropriate table
    let user
    if (upperRole === 'BUYER') {
      user = await prisma.buyer.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      })
    } else {
      user = await prisma.seller.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Create JWT token to automatically log in the user
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: upperRole 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 })

    // Set login cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
