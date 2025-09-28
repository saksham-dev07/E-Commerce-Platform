import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    let userData: any = {}

    // Get user data based on role
    if (decoded.role === 'BUYER') {
      const buyer = await prisma.buyer.findUnique({
        where: { id: decoded.userId },
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        include: {
          orders: {
            include: {
              orderItems: {
                include: {
                  product: {
                    select: {
                      name: true,
                      price: true,
                      category: true
                    }
                  }
                }
              }
            }
          },
          // @ts-ignore - TypeScript not recognizing Address model after regeneration
          addresses: true,
          cartItems: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  category: true
                }
              }
            }
          },
          wishlistItems: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  category: true
                }
              }
            }
          }
        }
      })

      if (buyer) {
        // Remove sensitive information
        const { password, ...buyerData } = buyer
        userData = {
          accountType: 'BUYER',
          ...buyerData
        }
      }
    } else if (decoded.role === 'SELLER') {
      const seller = await prisma.seller.findUnique({
        where: { id: decoded.userId },
        include: {
          products: {
            include: {
              orderItems: {
                include: {
                  order: {
                    select: {
                      status: true,
                      createdAt: true,
                      total: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (seller) {
        // Remove sensitive information
        // @ts-ignore - TypeScript not recognizing enhanced profile fields after regeneration
        const { password, bankAccountNumber, ifscCode, taxId, ...sellerData } = seller
        userData = {
          accountType: 'SELLER',
          ...sellerData
        }
      }
    }

    if (!userData.id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create JSON response with proper headers for download
    const jsonData = JSON.stringify(userData, null, 2)
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="account-data-${userData.id}.json"`
      }
    })

  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
