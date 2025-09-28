import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Delete user data in a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      if (decoded.role === 'BUYER') {
        // Delete related data first due to foreign key constraints
        await tx.cartItem.deleteMany({
          where: { buyerId: decoded.userId }
        })

        await tx.wishlistItem.deleteMany({
          where: { buyerId: decoded.userId }
        })

        // Delete addresses
        // @ts-ignore - TypeScript not recognizing Address model after regeneration
        await tx.address.deleteMany({
          where: { buyerId: decoded.userId }
        })

        // Note: Orders and OrderItems are typically kept for business records
        // but we'll delete them for complete account deletion
        const orders = await tx.order.findMany({
          where: { buyerId: decoded.userId }
        })

        for (const order of orders) {
          await tx.orderItem.deleteMany({
            where: { orderId: order.id }
          })
        }

        await tx.order.deleteMany({
          where: { buyerId: decoded.userId }
        })

        // Finally delete the buyer account
        await tx.buyer.delete({
          where: { id: decoded.userId }
        })

      } else if (decoded.role === 'SELLER') {
        // Delete related data first
        const products = await tx.product.findMany({
          where: { sellerId: decoded.userId }
        })

        for (const product of products) {
          // Delete cart items containing this product
          await tx.cartItem.deleteMany({
            where: { productId: product.id }
          })

          // Delete wishlist items containing this product
          await tx.wishlistItem.deleteMany({
            where: { productId: product.id }
          })

          // Note: OrderItems are typically kept for business records
          // but we'll handle them by setting product reference to null or deleting
          await tx.orderItem.deleteMany({
            where: { productId: product.id }
          })
        }

        // Delete products
        await tx.product.deleteMany({
          where: { sellerId: decoded.userId }
        })

        // Finally delete the seller account
        await tx.seller.delete({
          where: { id: decoded.userId }
        })
      }
    })

    // Clear the authentication cookie
    const response = NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return response

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
