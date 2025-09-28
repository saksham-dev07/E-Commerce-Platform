import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      console.log('No token found in cookies')
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No token found' },
        { status: 401 }
      )
    }

    console.log('Token found, attempting to verify...')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    console.log('Token decoded successfully:', { userId: decoded.userId, role: decoded.role })
    
    let user
    
    // Find user in appropriate table based on role from token
    if (decoded.role === 'BUYER') {
      user = await prisma.buyer.findUnique({
        where: { id: decoded.userId },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        select: { 
          id: true, 
          email: true, 
          name: true,
          // @ts-ignore - profileImage field not recognized by TypeScript
          profileImage: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
          preferredLanguage: true,
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: true
        }
      })
    } else if (decoded.role === 'SELLER') {
      user = await prisma.seller.findUnique({
        where: { id: decoded.userId },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        select: { 
          id: true, 
          email: true, 
          name: true,
          // @ts-ignore - profileImage field not recognized by TypeScript
          profileImage: true,
          phone: true,
          businessName: true,
          businessAddress: true
        }
      })
    }

    if (!user) {
      console.log('User not found in database for userId:', decoded.userId)
      return NextResponse.json(
        { error: 'User not found', details: 'User ID not found in database' },
        { status: 404 }
      )
    }

    console.log('User found successfully:', { id: user.id, email: user.email })
    // Add role to user object for response
    const userWithRole = { ...user, role: decoded.role }

    return NextResponse.json({ user: userWithRole }, { status: 200 })

  } catch (error) {
    console.error('Auth check error:', error)
    
    // More specific error handling
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token', details: 'Token verification failed' },
        { status: 401 }
      )
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired', details: 'Please login again' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const updateData = await request.json()
    
    let updatedUser
    
    // Update user in appropriate table based on role from token
    if (decoded.role === 'BUYER') {
      updatedUser = await prisma.buyer.update({
        where: { id: decoded.userId },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        data: {
          name: updateData.name,
          // @ts-ignore - profileImage field not recognized by TypeScript
          profileImage: updateData.profileImage,
          phone: updateData.phone,
          dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
          gender: updateData.gender,
          bio: updateData.bio,
          preferredLanguage: updateData.preferredLanguage,
          emailNotifications: updateData.emailNotifications,
          smsNotifications: updateData.smsNotifications,
          marketingEmails: updateData.marketingEmails
        },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        select: { 
          id: true, 
          email: true, 
          name: true,
          // @ts-ignore - profileImage field not recognized by TypeScript
          profileImage: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
          preferredLanguage: true,
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: true
        }
      })
    } else if (decoded.role === 'SELLER') {
      updatedUser = await prisma.seller.update({
        where: { id: decoded.userId },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        data: {
          name: updateData.name,
          // @ts-ignore - profileImage field not recognized by TypeScript
          profileImage: updateData.profileImage,
          phone: updateData.phone,
          businessName: updateData.businessName,
          businessAddress: updateData.businessAddress
        },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        select: { 
          id: true, 
          email: true, 
          name: true,
          // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration  
          profileImage: true,
          phone: true,
          businessName: true,
          businessAddress: true
        }
      })
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Add role to user object for response
    const userWithRole = { ...updatedUser, role: decoded.role }

    return NextResponse.json({ user: userWithRole }, { status: 200 })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
