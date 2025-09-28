'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { ShoppingCart, Heart, Package, Plus, Minus, Trash2, MapPin, CreditCard, Bell, User, Settings, Eye, Truck, Clock, CheckCircle, Search, Calendar, MapPinIcon, ChevronDown, ChevronUp } from 'lucide-react'

interface OrderTrackingProps {
  orders: any[]
  formatDateTime: (date: string) => { date: string; time: string }
}

export default function OrderTracking({ orders, formatDateTime }: OrderTrackingProps) {
  const [orderTrackingId, setOrderTrackingId] = useState('')
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [isTrackingMinimized, setIsTrackingMinimized] = useState(false)

  // Order tracking function
  const trackOrder = async () => {
    if (!orderTrackingId.trim()) return

    setTrackingLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderTrackingId}/track`)
      if (response.ok) {
        const data = await response.json()
        setTrackingResult(data)
      } else {
        setTrackingResult(null)
        alert('Order not found or you do not have permission to view it')
      }
    } catch (error) {
      alert('Error tracking order')
      setTrackingResult(null)
    } finally {
      setTrackingLoading(false)
    }
  }

  // Get status color with better visual hierarchy
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200'
      case 'current': return 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse'
      case 'pending': return 'bg-gray-200 border-gray-300 text-gray-500'
      default: return 'bg-gray-200 border-gray-300 text-gray-500'
    }
  }

  // Get icon component with check mark for completed
  const getIcon = (iconName: string, status?: string) => {
    const iconProps = { className: status === 'completed' ? "h-5 w-5" : "h-4 w-4" }
    
    // Show check mark for completed items
    if (status === 'completed') {
      return <CheckCircle {...iconProps} fill="currentColor" />
    }
    
    switch (iconName) {
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />
      case 'Package': return <Package {...iconProps} />
      case 'Truck': return <Truck {...iconProps} />
      case 'CheckCircle': return <CheckCircle {...iconProps} />
      case 'Clock': return <Clock {...iconProps} />
      case 'CreditCard': return <CreditCard {...iconProps} />
      default: return <Package {...iconProps} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
          <Truck className="h-5 w-5" />
          Track Your Order
        </CardTitle>
        <CardDescription className="text-sm">Enter your order ID to track its current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enhanced Input Section - Mobile Optimized */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 lg:p-6 rounded-xl border border-blue-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
              Enter Order Details
            </h3>
            {/* Mobile: Stack input and button vertically */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Order ID (e.g., cmeaa5u4c001d...)"
                  value={orderTrackingId}
                  onChange={(e) => setOrderTrackingId(e.target.value)}
                  className="h-10 lg:h-12 text-sm lg:text-base border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  aria-label="Order ID input"
                />
                <p className="text-xs text-gray-600 mt-1">
                  💡 Tip: You can find your Order ID in your order confirmation email
                </p>
              </div>
              <Button 
                onClick={trackOrder}
                disabled={!orderTrackingId.trim() || trackingLoading}
                className="h-10 lg:h-12 px-4 lg:px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg w-full sm:w-auto"
                size="lg"
              >
                {trackingLoading ? (
                  <>
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Tracking...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Track Order</span>
                    <span className="sm:hidden">Track</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {trackingResult && (
            <div className="space-y-4 lg:space-y-6 mt-6">
              {/* Quick Status Summary - Mobile Only */}
              <div className="lg:hidden">
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm opacity-90">Order Status</p>
                          <p className="font-bold text-lg">{trackingResult.tracking.currentStatus}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">ETA</p>
                        <p className="font-bold">{trackingResult.tracking.estimatedDelivery}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Card with Minimize/Expand Option - Mobile Optimized */}
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-green-50 shadow-lg">
                <CardHeader className="pb-3 lg:pb-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                    <div className="space-y-2">
                      <CardTitle className="text-lg lg:text-2xl text-blue-900 flex items-center gap-2">
                        <Package className="h-5 w-5 lg:h-6 lg:w-6" />
                        Order #{trackingResult.order.id.slice(-8)}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-blue-700">
                        <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-md w-fit">
                          <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="font-medium">Ordered:</span> {formatDateTime(trackingResult.order.createdAt).date}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></span>
                          <span className="font-semibold text-base lg:text-lg text-green-600">₹{trackingResult.order.total}</span>
                          <span className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{trackingResult.order.itemCount} item(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-xs lg:text-sm px-2 lg:px-3 py-1 font-semibold w-fit ${
                          trackingResult.tracking.currentStatus === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-300' :
                          trackingResult.tracking.currentStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          trackingResult.tracking.currentStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {trackingResult.tracking.currentStatus}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsTrackingMinimized(!isTrackingMinimized)}
                        className="flex items-center gap-1 text-xs px-2 py-1 h-7 lg:h-8 w-fit"
                        aria-label={isTrackingMinimized ? "Expand tracking details" : "Minimize tracking details"}
                      >
                        {isTrackingMinimized ? (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            <span className="hidden sm:inline">Expand</span>
                          </>
                        ) : (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            <span className="hidden sm:inline">Minimize</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <p className="text-xs lg:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-md w-fit">
                      <span className="font-medium">Tracking:</span> {trackingResult.tracking.trackingNumber}
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* Quick Summary when minimized */}
              {isTrackingMinimized && (
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Tracking Summary</p>
                          <p className="text-xs text-blue-700">
                            Status: {trackingResult.tracking.currentStatus} • 
                            ETA: {trackingResult.tracking.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsTrackingMinimized(false)}
                        className="text-xs px-3 py-1 h-7 bg-white border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Tracking Information - Collapsible */}
              <div className={`space-y-4 lg:space-y-6 transition-all duration-500 ease-in-out ${
                isTrackingMinimized ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-none'
              }`}>
                {/* Enhanced Delivery Estimate - Mobile Optimized */}
                <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 border-2 border-green-200 shadow-lg">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                          <Truck className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-base lg:text-lg font-bold text-green-900 mb-1">Estimated Delivery</p>
                          <p className="text-xl lg:text-2xl font-extrabold text-green-700">{trackingResult.tracking.estimatedDelivery}</p>
                          <p className="text-xs lg:text-sm text-green-600 mt-1">We'll notify you when it's delivered</p>
                        </div>
                      </div>
                      <div className="self-start sm:self-auto">
                        <div className="bg-white rounded-lg p-3 border border-green-200 w-fit">
                          <p className="text-xs lg:text-sm font-medium text-gray-700">Carrier</p>
                          <p className="text-base lg:text-lg font-bold text-green-600">{trackingResult.tracking.carrier}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Timeline - Mobile Optimized */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                          <Package className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                          Order Progress Timeline
                        </CardTitle>
                        <CardDescription className="text-sm">Track your order journey step by step</CardDescription>
                      </div>
                      <div className="flex items-center gap-3 lg:text-right">
                        {(() => {
                          const completedSteps = trackingResult.tracking.steps.filter((s: any) => s.status === 'completed').length
                          const totalSteps = trackingResult.tracking.steps.length
                          const percentage = Math.round((completedSteps / totalSteps) * 100)
                          
                          return (
                            <>
                              <div className="lg:text-right">
                                <p className="text-xs lg:text-sm font-medium text-gray-600">Progress</p>
                                <p className="text-lg lg:text-2xl font-bold text-blue-600">{percentage}%</p>
                              </div>
                              <div className="w-12 h-12 lg:w-16 lg:h-16 relative flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke={percentage === 100 ? "#10b981" : "#3b82f6"}
                                    strokeWidth="4"
                                    strokeDasharray={`${(percentage / 100) * 175.9} 175.9`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {percentage === 100 ? (
                                    <CheckCircle className="h-4 w-4 lg:h-6 lg:w-6 text-green-500" fill="currentColor" />
                                  ) : (
                                    <Package className="h-3 w-3 lg:h-5 lg:w-5 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    {/* Mobile: Horizontal Timeline, Desktop: Vertical Timeline */}
                    <div className="lg:hidden">
                      {/* Mobile Horizontal Timeline */}
                      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                        {trackingResult.tracking.steps.map((step: any, index: number) => (
                          <div 
                            key={step.id} 
                            className="flex-shrink-0 w-48 p-3 rounded-lg border bg-white shadow-sm"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                                getStatusColor(step.status)
                              } ${step.status !== 'completed' ? 'bg-white' : ''}`}>
                                {getIcon(step.icon, step.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm truncate ${
                                  step.status === 'completed' ? 'text-green-900' : 
                                  step.status === 'current' ? 'text-blue-900' : 'text-gray-500'
                                }`}>
                                  {step.title}
                                </h4>
                              </div>
                            </div>
                            
                            <p className={`text-xs mb-2 line-clamp-2 ${
                              step.status === 'completed' ? 'text-green-700' : 
                              step.status === 'current' ? 'text-blue-700' : 'text-gray-500'
                            }`}>
                              {step.description}
                            </p>
                            
                            {step.timestamp && (
                              <div className="text-xs bg-gray-50 rounded p-1 text-center">
                                <p className="font-medium text-gray-900">
                                  {formatDateTime(step.timestamp).date}
                                </p>
                              </div>
                            )}
                            
                            {step.status === 'completed' && (
                              <div className="mt-2 text-center">
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  ✓ Done
                                </Badge>
                              </div>
                            )}
                            {step.status === 'current' && (
                              <div className="mt-2 text-center">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs animate-pulse">
                                  🔄 Active
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Desktop Vertical Timeline */}
                    <div className="hidden lg:block relative" role="list" aria-label="Order tracking progress">
                      {/* Enhanced Progress bar with real-time calculation */}
                      <div className="absolute left-6 top-6 bottom-6 w-1 bg-gray-200 rounded-full overflow-hidden">
                        {(() => {
                          const completedSteps = trackingResult.tracking.steps.filter((s: any) => s.status === 'completed').length
                          const totalSteps = trackingResult.tracking.steps.length
                          const percentage = Math.min(100, (completedSteps / totalSteps) * 100)
                          
                          let heightClass = 'h-0'
                          if (percentage >= 100) heightClass = 'h-full'
                          else if (percentage >= 75) heightClass = 'h-3/4'
                          else if (percentage >= 50) heightClass = 'h-1/2'
                          else if (percentage >= 25) heightClass = 'h-1/4'
                          else if (percentage > 0) heightClass = 'h-1/12'
                          
                          return (
                            <div className={`bg-gradient-to-b from-green-400 to-blue-500 w-full rounded-full transition-all duration-1000 ease-in-out ${heightClass}`} />
                          )
                        })()}
                      </div>

                      {trackingResult.tracking.steps.map((step: any, index: number) => (
                        <div 
                          key={step.id} 
                          className={`flex items-start gap-4 pb-8 last:pb-0 transition-all duration-500 ${
                            step.status === 'current' ? 'transform scale-105' : ''
                          }`}
                          role="listitem"
                          aria-label={`${step.title} - ${step.status}`}
                        >
                          {/* Status Icon with enhanced styling */}
                          <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                            getStatusColor(step.status)
                          } ${step.status !== 'completed' ? 'bg-white' : ''}`}>
                            {step.status === 'completed' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" fill="currentColor" />
                              </div>
                            )}
                            {getIcon(step.icon, step.status)}
                          </div>
                          
                          {/* Content with improved accessibility */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold text-lg ${
                                  step.status === 'completed' ? 'text-green-900' : 
                                  step.status === 'current' ? 'text-blue-900' : 'text-gray-500'
                                }`}>
                                  {step.title}
                                </h4>
                                {step.status === 'completed' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                    ✓ Completed
                                  </Badge>
                                )}
                                {step.status === 'current' && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs animate-pulse">
                                    🔄 In Progress
                                  </Badge>
                                )}
                              </div>
                              {step.timestamp && (
                                <div className="text-right text-sm bg-gray-50 rounded-lg p-2">
                                  <p className="font-semibold text-gray-900">
                                    {formatDateTime(step.timestamp).date}
                                  </p>
                                  <p className="text-gray-600">
                                    {formatDateTime(step.timestamp).time}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-sm mb-3 leading-relaxed ${
                              step.status === 'completed' ? 'text-green-700' : 
                              step.status === 'current' ? 'text-blue-700' : 'text-gray-500'
                            }`}>
                              {step.description}
                            </p>
                            
                            {step.details && step.details.length > 0 && (
                              <div className={`mt-2 p-3 rounded-lg ${
                                step.status === 'completed' ? 'bg-green-50 border border-green-200' : 
                                step.status === 'current' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                              }`}>
                                <ul className="text-sm space-y-1">
                                  {step.details.map((detail: string, idx: number) => (
                                    <li key={idx} className={`flex items-center gap-2 ${
                                      step.status === 'completed' ? 'text-green-700' : 
                                      step.status === 'current' ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        step.status === 'completed' ? 'bg-green-500' : 
                                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-400'
                                      }`}></span>
                                      {detail}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Tracking History - Mobile Optimized */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gray-50 p-4 lg:p-6">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                      Detailed Tracking History
                    </CardTitle>
                    <CardDescription className="text-sm">Complete timeline of your order journey with real-time updates</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-3 lg:space-y-4" role="list" aria-label="Detailed tracking events">
                      {trackingResult.tracking.details.map((detail: any, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                          role="listitem"
                        >
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-200">
                            {getIcon(detail.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                              <h5 className="font-semibold text-gray-900 text-sm lg:text-base">{detail.title}</h5>
                              <div className="text-xs lg:text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-md w-fit">
                                {formatDateTime(detail.timestamp).time}
                              </div>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-700 mb-2 leading-relaxed">{detail.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-gray-500 bg-white px-2 lg:px-3 py-1 rounded-md border">
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{detail.location}</span>
                              </div>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{formatDateTime(detail.timestamp).date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items in this Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trackingResult.order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
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
                            <h6 className="font-medium">{item.product.name}</h6>
                            <div className="text-sm text-gray-500">
                              Quantity: {item.quantity} × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                            </div>
                            {item.product.seller && (
                              <div className="text-xs text-gray-400">
                                Sold by: {item.product.seller.name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Enhanced Recent Orders for Quick Tracking - Mobile Optimized */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                Quick Track Recent Orders
              </CardTitle>
              <CardDescription className="text-sm">Select from your recent orders for instant tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              {orders.length === 0 ? (
                <div className="text-center py-6 lg:py-8">
                  <Package className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-base lg:text-lg">No recent orders found</p>
                  <p className="text-xs lg:text-sm text-gray-400 mt-1">Your orders will appear here once you make a purchase</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 lg:p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm lg:text-base">Order #{order.id.slice(-8)}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs lg:text-sm text-gray-600">
                            <span className="font-medium">₹{order.total}</span>
                            <span className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{formatDateTime(order.createdAt).date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {order.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            setOrderTrackingId(order.id)
                            trackOrder()
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 text-xs lg:text-sm"
                        >
                          <Truck className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <div className="text-center pt-2">
                      <p className="text-xs lg:text-sm text-gray-500">
                        Showing 3 of {orders.length} recent orders
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Floating Action Menu */}
          {trackingResult && (
            <div className="lg:hidden fixed bottom-6 right-4 z-50">
              <div className="flex flex-col gap-2">
                {/* Copy Tracking Info */}
                <Button
                  size="sm"
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg border-2 border-white"
                  onClick={() => {
                    const text = `Order #${trackingResult.order.id.slice(-8)}\nStatus: ${trackingResult.tracking.currentStatus}\nTracking: ${trackingResult.tracking.trackingNumber}\nETA: ${trackingResult.tracking.estimatedDelivery}`;
                    navigator.clipboard.writeText(text);
                    // You could add a toast notification here
                  }}
                  title="Copy tracking info"
                >
                  📋
                </Button>
                {/* Share Tracking Status */}
                <Button
                  size="sm"
                  className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 shadow-lg border-2 border-white"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Order Tracking',
                        text: `My order #${trackingResult.order.id.slice(-8)} is ${trackingResult.tracking.currentStatus}`,
                      });
                    } else {
                      // Fallback for browsers that don't support Web Share API
                      const text = `My order #${trackingResult.order.id.slice(-8)} is ${trackingResult.tracking.currentStatus}`;
                      navigator.clipboard.writeText(text);
                    }
                  }}
                  title="Share tracking status"
                >
                  📤
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
