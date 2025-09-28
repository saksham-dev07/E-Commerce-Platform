"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Menu, X, ShoppingCart, User, LogOut, Settings, Bell, Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
  authRequired?: boolean;
  roles?: ('BUYER' | 'SELLER')[];
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [buyerNotificationCount, setBuyerNotificationCount] = useState(0);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const cartHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wishlistHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, logout } = useAuth();

  // Check if delivery agent is logged in
  const [isDeliveryAgent, setIsDeliveryAgent] = useState(false);
  const [deliveryAgentName, setDeliveryAgentName] = useState('');

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId: string, userType: 'buyer' | 'seller') => {
    const storageKey = `readNotifications-${userType}`;
    const timestampKey = `lastReadTimestamp-${userType}`;
    const readNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem(storageKey, JSON.stringify(readNotifications));
      localStorage.setItem(timestampKey, Date.now().toString());
      
      // Update the count immediately
      if (userType === 'buyer') {
        setBuyerNotificationCount(Math.max(0, buyerNotificationCount - 1));
      } else {
        setPendingOrdersCount(Math.max(0, pendingOrdersCount - 1));
      }
    }
  };

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = (userType: 'buyer' | 'seller') => {
    const timestampKey = `lastReadTimestamp-${userType}`;
    localStorage.setItem(timestampKey, Date.now().toString());
    
    if (userType === 'buyer') {
      const allNotificationIds = notifications.map(n => n.id);
      localStorage.setItem('readNotifications-buyer', JSON.stringify(allNotificationIds));
      setBuyerNotificationCount(0);
    } else {
      setPendingOrdersCount(0);
    }
  };

  // Function to clean up old read notifications from localStorage
  const cleanupOldReadNotifications = () => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    ['buyer', 'seller'].forEach(userType => {
      const timestampKey = `lastReadTimestamp-${userType}`;
      const storageKey = `readNotifications-${userType}`;
      const lastReadTimestamp = localStorage.getItem(timestampKey);
      
      if (lastReadTimestamp && parseInt(lastReadTimestamp) < oneWeekAgo) {
        // If last read was more than a week ago, clear the read notifications
        localStorage.removeItem(storageKey);
        localStorage.setItem(timestampKey, Date.now().toString());
      }
    });
  };

  useEffect(() => {
    const deliveryAgentToken = localStorage.getItem('deliveryAgentToken');
    const deliveryAgentData = localStorage.getItem('deliveryAgent');
    
    setIsDeliveryAgent(!!deliveryAgentToken);
    
    if (deliveryAgentData) {
      try {
        const agent = JSON.parse(deliveryAgentData);
        setDeliveryAgentName(agent.name || 'Agent');
      } catch (error) {
        console.error('Error parsing delivery agent data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Clean up old read notifications on component mount
    cleanupOldReadNotifications();
  }, []);

  // Clear delivery agent state when regular user logs in
  useEffect(() => {
    if (user && (user.role === 'BUYER' || user.role === 'SELLER')) {
      // If a regular user is logged in, clear any existing delivery agent session
      if (isDeliveryAgent) {
        localStorage.removeItem('deliveryAgentToken');
        localStorage.removeItem('deliveryAgent');
        setIsDeliveryAgent(false);
      }
    }
  }, [user, isDeliveryAgent]);

  // Cart dropdown hover handlers with delay
  const handleCartMouseEnter = () => {
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
    }
    setShowCartDropdown(true);
  };

  const handleCartMouseLeave = () => {
    cartHoverTimeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false);
    }, 150); // 150ms delay before closing
  };

  // Wishlist dropdown hover handlers
  const handleWishlistMouseEnter = () => {
    if (wishlistHoverTimeoutRef.current) {
      clearTimeout(wishlistHoverTimeoutRef.current);
    }
    setShowWishlistDropdown(true);
  };

  const handleWishlistMouseLeave = () => {
    wishlistHoverTimeoutRef.current = setTimeout(() => {
      setShowWishlistDropdown(false);
    }, 150);
  };

  // Notification dropdown hover handlers
  const handleNotificationMouseEnter = () => {
    if (notificationHoverTimeoutRef.current) {
      clearTimeout(notificationHoverTimeoutRef.current);
    }
    setShowNotificationDropdown(true);
  };

  const handleNotificationMouseLeave = () => {
    notificationHoverTimeoutRef.current = setTimeout(() => {
      setShowNotificationDropdown(false);
    }, 150);
  };

  // Fetch cart count and items
  const fetchCartCount = async () => {
    if (!user || user.role !== 'BUYER') {
      setCartCount(0);
      setCartItems([]);
      return;
    }
    
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.itemCount || 0);
        setCartItems(data.cartItems || []);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Fetch pending orders count for sellers
  const fetchPendingOrdersCount = async () => {
    if (!user || user.role !== 'SELLER') {
      setPendingOrdersCount(0);
      return;
    }
    
    try {
      const response = await fetch('/api/seller/notifications');
      if (response.ok) {
        const data = await response.json();
        
        // If no notifications from API, set count to 0
        if (!data.notifications || data.notifications.length === 0) {
          setPendingOrdersCount(0);
          return;
        }
        
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications-seller') || '[]');
        const lastReadTimestamp = localStorage.getItem('lastReadTimestamp-seller') || '0';
        
        // Count truly unread notifications (not in read list and created after last read time)
        const unreadCount = data.notifications.filter((notification: any) => {
          const notificationTime = new Date(notification.createdAt).getTime();
          const lastRead = parseInt(lastReadTimestamp);
          return !readNotifications.includes(notification.id) && notificationTime > lastRead;
        }).length;
        
        setPendingOrdersCount(unreadCount);
      } else {
        // If API call fails, set count to 0
        setPendingOrdersCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
      setPendingOrdersCount(0);
    }
  };
  const fetchWishlistCount = async () => {
    if (!user || user.role !== 'BUYER') {
      setWishlistCount(0);
      setWishlistItems([]);
      return;
    }
    
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.itemCount || 0);
        setWishlistItems(data.wishlistItems || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  // Fetch buyer notifications count
  const fetchBuyerNotificationCount = async () => {
    if (!user || user.role !== 'BUYER') {
      setBuyerNotificationCount(0);
      setNotifications([]);
      return;
    }
    
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        
        // If no notifications from API, set count to 0
        if (!data.notifications || data.notifications.length === 0) {
          setBuyerNotificationCount(0);
          setNotifications([]);
          return;
        }
        
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications-buyer') || '[]');
        const lastReadTimestamp = localStorage.getItem('lastReadTimestamp-buyer') || '0';
        
        // Count truly unread notifications (not in read list and created after last read time)
        const unreadCount = data.notifications.filter((notification: any) => {
          const notificationTime = new Date(notification.createdAt).getTime();
          const lastRead = parseInt(lastReadTimestamp);
          return !readNotifications.includes(notification.id) && notificationTime > lastRead;
        }).length;
        
        setBuyerNotificationCount(unreadCount);
        setNotifications(data.notifications || []);
      } else {
        // If API call fails, set count to 0
        setBuyerNotificationCount(0);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching buyer notifications count:', error);
      setBuyerNotificationCount(0);
      setNotifications([]);
    }
  };

  // Fetch counts when user changes
  useEffect(() => {
    if (user && user.role === 'BUYER') {
      fetchCartCount();
      fetchWishlistCount();
      fetchBuyerNotificationCount();
      setPendingOrdersCount(0);
    } else if (user && user.role === 'SELLER') {
      setCartCount(0);
      setWishlistCount(0);
      setCartItems([]);
      setBuyerNotificationCount(0);
      fetchPendingOrdersCount();
    } else {
      setCartCount(0);
      setWishlistCount(0);
      setCartItems([]);
      setWishlistItems([]);
      setNotifications([]);
      setPendingOrdersCount(0);
      setBuyerNotificationCount(0);
    }

    // Set up periodic refresh for real-time updates
    let notificationInterval: NodeJS.Timeout | null = null;
    let cartInterval: NodeJS.Timeout | null = null;
    
    if (user) {
      notificationInterval = setInterval(() => {
        if (user.role === 'BUYER') {
          fetchBuyerNotificationCount();
        } else if (user.role === 'SELLER') {
          fetchPendingOrdersCount();
        }
      }, 30000); // Refresh every 30 seconds

      if (user.role === 'BUYER') {
        cartInterval = setInterval(() => {
          fetchCartCount();
          fetchWishlistCount();
        }, 60000); // Refresh every minute
      }
    }

    // Cleanup timeout on unmount or user change
    return () => {
      if (cartHoverTimeoutRef.current) {
        clearTimeout(cartHoverTimeoutRef.current);
      }
      if (wishlistHoverTimeoutRef.current) {
        clearTimeout(wishlistHoverTimeoutRef.current);
      }
      if (notificationHoverTimeoutRef.current) {
        clearTimeout(notificationHoverTimeoutRef.current);
      }
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
      if (cartInterval) {
        clearInterval(cartInterval);
      }
    };
  }, [user]);

  // Function to refresh counts (can be called from other components)
  const refreshCounts = () => {
    if (user && user.role === 'BUYER') {
      fetchCartCount();
      fetchWishlistCount();
      fetchBuyerNotificationCount();
    } else if (user && user.role === 'SELLER') {
      fetchPendingOrdersCount();
    }
  };

  // Make refresh function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshNavbarCounts = refreshCounts;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshNavbarCounts;
      }
    };
  }, [user]);

  // Auto-refresh counts every 30 seconds when user is active
  useEffect(() => {
    if (!user || user.role !== 'BUYER') return;
    
    const interval = setInterval(() => {
      refreshCounts();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  // Handle checkout for cart dropdown
  const handleQuickCheckout = () => {
    if (cartItems.length === 0) return;
    
    // For quick checkout from navbar, redirect to the full cart page
    // where users can enter shipping address and complete the order
    window.location.href = '/cart';
  };
  useEffect(() => {
    (window as any).refreshNavbarCounts = refreshCounts;
    return () => {
      delete (window as any).refreshNavbarCounts;
    };
  }, [user]);

  // Dynamic navigation links based on authentication
  const getNavLinks = (): NavLink[] => {
    const baseLinks: NavLink[] = [
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/search", label: "Search", icon: "🔍" },
    ];

    // Only show delivery portal if no regular user is logged in
    if (!user) {
      if (isDeliveryAgent) {
        // If delivery agent is logged in, show link to dashboard
        baseLinks.push({ href: "/delivery-agent", label: "My Dashboard", icon: "🚚" });
      } else {
        // If no user is logged in, show delivery portal login
        baseLinks.push({ href: "/delivery-agent", label: "Delivery Portal", icon: "🚚" });
      }
    }
    // If regular user (buyer/seller) is logged in, don't show delivery portal at all

    if (user) {
      const userLinks: NavLink[] = [
        { 
          href: "/buyer-dashboard", 
          label: "My Account", 
          icon: <User size={16} />, 
          authRequired: true, 
          roles: ['BUYER'] 
        },
        { 
          href: "/seller", 
          label: "Seller Hub", 
          icon: "💼", 
          authRequired: true, 
          roles: ['SELLER'] 
        },
      ];

      return [...baseLinks, ...userLinks.filter(link => 
        !link.roles || link.roles.includes(user.role)
      )];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    // Handle regular user logout
    if (user) {
      await logout();
    }
    
    // Handle delivery agent logout
    if (isDeliveryAgent) {
      localStorage.removeItem('deliveryAgentToken');
      localStorage.removeItem('deliveryAgent');
      setIsDeliveryAgent(false);
      window.location.href = '/';
    }
    
    setMobileOpen(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon"; 
    return "Good evening";
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm shadow-lg py-3 px-6 sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ecommerce
            </span>
            <div className="text-xs text-gray-500 -mt-1">Your Shopping Paradise</div>
          </div>
        </Link>

        {/* Welcome Message for Logged In Users */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
            <span className="text-sm text-gray-600">{getGreeting()},</span>
            <span className="text-sm font-semibold text-blue-700">{user.name}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 border border-transparent hover:border-blue-200"
                }`}
              >
                {link.icon && <span className="text-sm">{link.icon}</span>}
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Side - Auth & Actions */}
        <div className="flex items-center gap-3">
          {user || isDeliveryAgent ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Cart and Wishlist Icons for Buyers */}
              {user?.role === 'BUYER' && (
                <>
                  {/* Wishlist Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={handleWishlistMouseEnter}
                    onMouseLeave={handleWishlistMouseLeave}
                  >
                    <Link href="/wishlist">
                      <button 
                        title="Wishlist"
                        className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200"
                      >
                        <Heart size={18} />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse z-10 shadow-lg border-2 border-white">
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                          </span>
                        )}
                      </button>
                    </Link>

                    {/* Wishlist Dropdown */}
                    {showWishlistDropdown && (
                      <div 
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Wishlist</h3>
                            <span className="text-sm text-gray-500">{wishlistCount} items</span>
                          </div>
                          
                          {wishlistItems.length === 0 ? (
                            <div className="text-center py-6">
                              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-gray-500">Your wishlist is empty</p>
                            </div>
                          ) : (
                            <>
                              <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                                {wishlistItems.slice(0, 3).map((item) => (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      {item.product.imageUrl ? (
                                        <img 
                                          src={item.product.imageUrl} 
                                          alt={item.product.name}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <div className="text-gray-400 text-xs">IMG</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.product.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        ₹{item.product.price}
                                      </p>
                                    </div>
                                    <div className="text-sm font-medium text-pink-600">
                                      ♥
                                    </div>
                                  </div>
                                ))}
                                {wishlistItems.length > 3 && (
                                  <p className="text-center text-sm text-gray-500">
                                    +{wishlistItems.length - 3} more items
                                  </p>
                                )}
                              </div>
                              
                              <div className="border-t pt-3">
                                <Link href="/wishlist" onClick={() => setShowWishlistDropdown(false)}>
                                  <Button className="w-full bg-pink-600 hover:bg-pink-700">
                                    View Full Wishlist
                                  </Button>
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cart Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={handleCartMouseEnter}
                    onMouseLeave={handleCartMouseLeave}
                  >
                    <Link href="/cart">
                      <button 
                        title="Shopping Cart"
                        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                      >
                        <ShoppingCart size={18} />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse z-10 shadow-lg border-2 border-white">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </button>
                    </Link>

                    {/* Cart Dropdown */}
                    {showCartDropdown && (
                      <div 
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
                            <span className="text-sm text-gray-500">{cartCount} items</span>
                          </div>
                          
                          {cartItems.length === 0 ? (
                            <div className="text-center py-6">
                              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-gray-500">Your cart is empty</p>
                            </div>
                          ) : (
                            <>
                              <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                                {cartItems.slice(0, 3).map((item) => (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      {item.product.imageUrl ? (
                                        <img 
                                          src={item.product.imageUrl} 
                                          alt={item.product.name}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <div className="text-gray-400 text-xs">IMG</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.product.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        ₹{item.product.price} × {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ₹{(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                                {cartItems.length > 3 && (
                                  <p className="text-center text-sm text-gray-500">
                                    +{cartItems.length - 3} more items
                                  </p>
                                )}
                              </div>
                              
                              <div className="border-t pt-3">
                                <div className="flex justify-between mb-3">
                                  <span className="font-medium">Total:</span>
                                  <span className="font-bold text-lg">
                                    ₹{cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={handleQuickCheckout}
                                  >
                                    Quick Checkout
                                  </Button>
                                  <Link href="/cart" onClick={() => setShowCartDropdown(false)}>
                                    <Button variant="outline" className="w-full">
                                      View Full Cart
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notification Bell */}
              {user?.role === 'SELLER' ? (
                <Link href="/seller/orders" onClick={() => markAllNotificationsAsRead('seller')}>
                  <button 
                    title={`Notifications - ${pendingOrdersCount} pending orders`}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                  >
                    <Bell size={18} />
                    {pendingOrdersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse z-10 shadow-lg border-2 border-white">
                        {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                      </span>
                    )}
                  </button>
                </Link>
              ) : user?.role === 'BUYER' ? (
                <div 
                  className="relative"
                  onMouseEnter={handleNotificationMouseEnter}
                  onMouseLeave={handleNotificationMouseLeave}
                >
                  <Link href="/buyer-dashboard?tab=notifications" onClick={() => markAllNotificationsAsRead('buyer')}>
                    <button 
                      title={`Notifications - ${buyerNotificationCount} new updates`}
                      className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                    >
                      <Bell size={18} />
                      {buyerNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse z-10 shadow-lg border-2 border-white">
                          {buyerNotificationCount > 99 ? '99+' : buyerNotificationCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  {/* Notifications Dropdown */}
                  {showNotificationDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{buyerNotificationCount} new</span>
                            {buyerNotificationCount > 0 && (
                              <button
                                onClick={() => markAllNotificationsAsRead('buyer')}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className="text-center py-6">
                            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          <>
                            <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                              {notifications.slice(0, 3).map((notification) => {
                                const readNotifications = JSON.parse(localStorage.getItem('readNotifications-buyer') || '[]');
                                const lastReadTimestamp = localStorage.getItem('lastReadTimestamp-buyer') || '0';
                                const notificationTime = new Date(notification.createdAt).getTime();
                                const lastRead = parseInt(lastReadTimestamp);
                                const isRead = readNotifications.includes(notification.id) || notificationTime <= lastRead;
                                
                                return (
                                  <div 
                                    key={notification.id} 
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${!isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                                    onClick={() => {
                                      markNotificationAsRead(notification.id, 'buyer');
                                      setShowNotificationDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${!isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {notifications.length > 3 && (
                                <p className="text-center text-sm text-gray-500">
                                  +{notifications.length - 3} more notifications
                                </p>
                              )}
                            </div>
                            
                            <div className="border-t pt-3">
                              <Link 
                                href="/buyer-dashboard?tab=notifications" 
                                onClick={() => {
                                  markAllNotificationsAsRead('buyer');
                                  setShowNotificationDropdown(false);
                                }}
                              >
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                  View All Notifications
                                </Button>
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  title="Notifications"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                >
                  <Bell size={18} />
                </button>
              )}
              
              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Link href={user ? "/buyer-dashboard?tab=profile" : "/delivery-agent"}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform duration-200">
                    {user ? user.name.charAt(0).toUpperCase() : deliveryAgentName.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/buyer">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <User size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/auth/seller">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Start Selling
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-xl rounded-b-2xl">
          <div className="flex flex-col px-6 py-4 space-y-3">
            {/* Mobile Welcome Message */}
            {user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-xl border border-blue-200 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{getGreeting()},</div>
                    <div className="text-sm font-semibold text-blue-700">{user.name}</div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700"
                }`}
              >
                {link.icon && <span className="text-lg">{link.icon}</span>}
                {link.label}
              </Link>
            ))}

            {/* Mobile Cart and Wishlist for Buyers */}
            {user && user.role === 'BUYER' && (
              <>
                <Link 
                  href="/wishlist" 
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    pathname === '/wishlist'
                      ? "bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 hover:text-pink-700"
                  }`}
                >
                  <div className="relative">
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium z-10 shadow-lg border border-white">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </div>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>

                <Link 
                  href="/cart" 
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    pathname === '/cart'
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700"
                  }`}
                >
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium z-10 shadow-lg border border-white">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </>
            )}
            
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {user ? (
                <div className="space-y-2">
                  {user?.role === 'SELLER' ? (
                    <Link href="/seller/orders" onClick={() => markAllNotificationsAsRead('seller')}>
                      <button 
                        title="Notifications"
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                      >
                        <div className="relative">
                          <Bell size={18} />
                          {pendingOrdersCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium z-10 shadow-lg border border-white">
                              {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
                            </span>
                          )}
                        </div>
                        Notifications {pendingOrdersCount > 0 && `(${pendingOrdersCount})`}
                      </button>
                    </Link>
                  ) : user?.role === 'BUYER' ? (
                    <Link href="/buyer-dashboard" onClick={() => markAllNotificationsAsRead('buyer')}>
                      <button 
                        title="Notifications"
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                      >
                        <div className="relative">
                          <Bell size={18} />
                          {buyerNotificationCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium z-10 shadow-lg border border-white">
                              {buyerNotificationCount > 9 ? '9+' : buyerNotificationCount}
                            </span>
                          )}
                        </div>
                        Notifications {buyerNotificationCount > 0 && `(${buyerNotificationCount})`}
                      </button>
                    </Link>
                  ) : (
                    <button 
                      title="Notifications"
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                    >
                      <Bell size={18} />
                      Notifications
                    </button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/buyer" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                      <User size={16} className="mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/seller" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      🚀 Start Selling
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
