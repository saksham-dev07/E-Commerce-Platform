import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()
    
    console.log('Login attempt:', { email, role, passwordLength: password?.length })

    // Validate input
    if (!email || !password || !role) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['BUYER', 'SELLER'].includes(role)) {
      console.log('Invalid role:', role)
      return NextResponse.json(
        { error: 'Invalid role. Must be BUYER or SELLER' },
        { status: 400 }
      )
    }

    let user
    
    // Find user in appropriate table based on role
    if (role === 'BUYER') {
      user = await prisma.buyer.findUnique({
        where: { email }
      })
      console.log('Buyer found:', user ? { id: user.id, email: user.email } : 'No buyer found')
    } else {
      user = await prisma.seller.findUnique({
        where: { email }
      })
      console.log('Seller found:', user ? { id: user.id, email: user.email } : 'No seller found')
    }

    if (!user) {
      console.log('User not found for email:', email, 'role:', role)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password verification:', { isPasswordValid, hashedPassword: user.password.substring(0, 10) + '...' })

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    }, { status: 200 })

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
