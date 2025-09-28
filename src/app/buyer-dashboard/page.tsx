'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

// Import the new components
import OrderTracking from '../../components/buyer/OrderTracking'
import UserProfile from '../../components/buyer/UserProfile'
import AccountSettings from '../../components/buyer/AccountSettings'
import OrdersList from '../../components/buyer/OrdersList'
import WishlistSection from '../../components/buyer/WishlistSection'
import CartSection from '../../components/buyer/CartSection'
import BuyerNotifications from '../../components/buyer/BuyerNotifications'

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  seller: { name: string }
}

interface CartItem {
  id: string
  quantity: number
  product: Product
}

interface WishlistItem {
  id: string
  product: Product
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: Product
}

interface Order {
  id: string
  total: number
  status: string
  shippingAddress: string
  createdAt: string
  orderItems: OrderItem[]
  processingAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
}

export default function BuyerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('cart')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    addresses: []
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // Format date and time helper
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Add wishlist loading state
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ]

  // Save profile function
  const saveProfile = async () => {
    setProfileLoading(true)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (response.ok) {
        setEditingProfile(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Redirect if not buyer
  useEffect(() => {
    if (user && user.role !== 'BUYER') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Handle URL parameters to set active tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['cart', 'orders', 'wishlist', 'tracking', 'notifications', 'profile', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.cartItems || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  // Fetch wishlist items
  const fetchWishlistItems = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlistItems || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Update cart quantity
  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return
    setCartLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      })
      if (response.ok) {
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setCartLoading(false)
    }
  }

  // Remove from cart
  const removeFromCart = async (productId: string) => {
    setCartLoading(true)
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setCartLoading(false)
    }
  }

  // Add to cart from wishlist
  const addToCartFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })
      if (response.ok) {
        await fetchCartItems()
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      if (response.ok) {
        await fetchWishlistItems()
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchCartItems(),
        fetchWishlistItems(),
        fetchOrders()
      ])
      setIsLoading(false)
    }

    if (user?.role === 'BUYER') {
      fetchData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Loading Header */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="h-6 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Desktop Loading Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 lg:py-8">
          <div className="animate-pulse">
            {/* Mobile Tabs Loading */}
            <div className="lg:hidden mb-6">
              <div className="flex space-x-2 overflow-x-auto p-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 h-8 w-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>

            {/* Desktop Tabs Loading */}
            <div className="hidden lg:block mb-8">
              <div className="grid grid-cols-7 gap-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>

            {/* Content Loading */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your orders, profile, and preferences</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="lg:hidden mb-6">
            <TabsList className="flex w-full overflow-x-auto scrollbar-hide bg-white rounded-lg shadow-sm border p-1">
              <TabsTrigger value="cart" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                🛒 Cart
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                📦 Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                ❤️ Wishlist
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                🚚 Tracking
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                🔔 Alerts
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                👤 Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-shrink-0 px-3 py-2 text-xs whitespace-nowrap">
                ⚙️ Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Tabs - Grid Layout */}
          <div className="hidden lg:block mb-8">
            <TabsList className="grid w-full grid-cols-7 bg-white rounded-lg shadow-sm border p-1">
              <TabsTrigger value="cart" className="py-3 flex items-center gap-2">
                🛒 Cart
              </TabsTrigger>
              <TabsTrigger value="orders" className="py-3 flex items-center gap-2">
                📦 Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="py-3 flex items-center gap-2">
                ❤️ Wishlist
              </TabsTrigger>
              <TabsTrigger value="tracking" className="py-3 flex items-center gap-2">
                🚚 Tracking
              </TabsTrigger>
              <TabsTrigger value="notifications" className="py-3 flex items-center gap-2">
                🔔 Notifications
              </TabsTrigger>
              <TabsTrigger value="profile" className="py-3 flex items-center gap-2">
                👤 Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="py-3 flex items-center gap-2">
                ⚙️ Settings
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="cart" className="mt-6">
          <CartSection 
            cartItems={cartItems}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            cartLoading={cartLoading}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersList orders={orders} formatDateTime={formatDateTime} />
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          <WishlistSection 
            wishlistItems={wishlistItems}
            removeFromWishlist={removeFromWishlist}
            addToCart={addToCartFromWishlist}
            wishlistLoading={wishlistLoading}
          />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <OrderTracking orders={orders} formatDateTime={formatDateTime} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <BuyerNotifications />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <UserProfile 
            user={user}
            profile={{...profile, orders: orders}}
            setProfile={setProfile}
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            profileLoading={profileLoading}
            saveProfile={saveProfile}
            indianStates={indianStates}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AccountSettings 
            user={user}
            profile={profile}
            setProfile={setProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}
