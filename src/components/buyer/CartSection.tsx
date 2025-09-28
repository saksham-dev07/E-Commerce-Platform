'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ShoppingCart, Package, Plus, Minus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface CartProps {
  cartItems: any[]
  updateCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  cartLoading: boolean
}

export default function CartSection({ cartItems, updateCartQuantity, removeFromCart, cartLoading }: CartProps) {
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          My Cart
        </CardTitle>
        <CardDescription>Items ready for checkout</CardDescription>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add some products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-green-600">₹{item.product.price}</span>
                      <Badge variant="outline">{item.product.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      disabled={cartLoading || item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={cartLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromCart(item.product.id)}
                    disabled={cartLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total: ₹{cartTotal.toFixed(2)}</span>
                <Badge variant="outline">{cartItems.length} items</Badge>
              </div>
              <Link href="/cart">
                <Button className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
