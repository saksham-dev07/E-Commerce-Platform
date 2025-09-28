import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Track order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { id: orderId } = await params;

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        AND: [
          { id: orderId },
          { buyerId: decoded.userId }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                seller: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate realistic tracking timeline with actual dates
    const trackingSteps = generateTrackingTimeline(order);
    const trackingDetails = generateTrackingDetails(order);

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        items: order.orderItems,
        itemCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      tracking: {
        steps: trackingSteps,
        details: trackingDetails,
        currentStatus: order.status,
        estimatedDelivery: calculateEstimatedDelivery(order.status, order.createdAt),
        trackingNumber: `TRK${order.id.slice(-8).toUpperCase()}`,
        carrier: 'Express Delivery Services'
      }
    });

  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateTrackingTimeline(order: any) {
  const orderDate = new Date(order.createdAt);
  const lastUpdate = new Date(order.updatedAt);
  
  const steps = [
    {
      id: 'ordered',
      title: 'Order Placed',
      description: 'Your order has been successfully placed and payment confirmed',
      status: 'completed', // Always completed since order exists
      timestamp: orderDate,
      icon: 'ShoppingCart',
      details: [
        'Order confirmation sent to your email',
        'Payment successfully processed',
        `Order ID: ${order.id.slice(-8)}`
      ]
    },
    {
      id: 'processing',
      title: 'Order Processing',
      description: 'Your order is being prepared and packed',
      status: getStepStatus('PROCESSING', order.status),
      timestamp: order.status === 'PROCESSING' ? lastUpdate : 
                order.status === 'SHIPPED' || order.status === 'DELIVERED' ? lastUpdate : null,
      icon: 'Package',
      details: order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? [
        'Items picked from inventory',
        'Quality check completed',
        'Packaging in progress'
      ] : [
        'Waiting for processing to begin'
      ]
    },
    {
      id: 'shipped',
      title: 'Order Shipped',
      description: 'Your order is on the way to your address',
      status: getStepStatus('SHIPPED', order.status),
      timestamp: order.status === 'SHIPPED' ? lastUpdate : 
                order.status === 'DELIVERED' ? lastUpdate : null,
      icon: 'Truck',
      details: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? [
        'Package handed over to courier',
        `Tracking number: TRK${order.id.slice(-8).toUpperCase()}`,
        'Expected delivery in 2-3 business days'
      ] : [
        'Awaiting shipment'
      ]
    },
    {
      id: 'delivered',
      title: 'Order Delivered',
      description: 'Your order has been delivered successfully',
      status: getStepStatus('DELIVERED', order.status),
      timestamp: order.status === 'DELIVERED' ? lastUpdate : null,
      icon: 'CheckCircle',
      details: order.status === 'DELIVERED' ? [
        'Package delivered to recipient',
        'Delivery confirmation received',
        'Thank you for shopping with us!'
      ] : [
        'Delivery pending'
      ]
    }
  ];

  return steps;
}

function generateTrackingDetails(order: any) {
  const orderDate = new Date(order.createdAt);
  const lastUpdate = new Date(order.updatedAt);
  const details = [];

  // Always show order placed (real timestamp)
  details.push({
    timestamp: orderDate,
    title: 'Order Placed',
    description: `Order #${order.id.slice(-8)} has been placed successfully`,
    location: 'Online Store',
    icon: 'ShoppingCart'
  });

  // Only add events that have actually happened based on current status
  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    // If status has moved beyond PENDING, show processing events
    details.push({
      timestamp: lastUpdate,
      title: 'Order Confirmed',
      description: 'Payment has been processed and order confirmed',
      location: 'Payment Gateway',
      icon: 'CreditCard'
    });

    details.push({
      timestamp: lastUpdate,
      title: 'Order Processing Started',
      description: 'Your order is now being prepared for shipment',
      location: 'Fulfillment Center',
      icon: 'Package'
    });
  }

  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    // If status has moved to SHIPPED or DELIVERED
    details.push({
      timestamp: lastUpdate,
      title: 'Items Packed',
      description: 'All items have been carefully packed and ready for pickup',
      location: 'Fulfillment Center',
      icon: 'Package'
    });

    details.push({
      timestamp: lastUpdate,
      title: 'Package Shipped',
      description: 'Package has been picked up and is in transit',
      location: 'Logistics Hub',
      icon: 'Truck'
    });
  }

  if (order.status === 'DELIVERED') {
    // Only show delivery if actually delivered
    details.push({
      timestamp: lastUpdate,
      title: 'Package Delivered',
      description: 'Package delivered successfully to recipient',
      location: 'Your Address',
      icon: 'CheckCircle'
    });
  }

  if (order.status === 'CANCELLED') {
    // Show cancellation if cancelled
    details.push({
      timestamp: lastUpdate,
      title: 'Order Cancelled',
      description: 'Order has been cancelled as requested',
      location: 'Customer Service',
      icon: 'Clock'
    });
  }

  return details.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function getStepStatus(stepStatus: string, orderStatus: string): string {
  const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const stepIndex = statusOrder.indexOf(stepStatus);
  const currentIndex = statusOrder.indexOf(orderStatus);
  
  if (stepIndex <= currentIndex) {
    return 'completed';
  } else if (stepIndex === currentIndex + 1) {
    return 'current';
  } else {
    return 'pending';
  }
}

function calculateEstimatedDelivery(status: string, orderDate: Date): string {
  const orderTime = new Date(orderDate);
  const now = new Date();
  
  if (status === 'DELIVERED') {
    return 'Delivered';
  }
  
  // Calculate days since order was placed
  const daysSinceOrder = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60 * 60 * 24));
  
  let remainingDays = 0;
  
  switch (status) {
    case 'PENDING':
      remainingDays = Math.max(1, 7 - daysSinceOrder); // 7 days total, minus days already passed
      break;
    case 'PROCESSING':
      remainingDays = Math.max(1, 5 - daysSinceOrder); // 5 days from processing
      break;
    case 'SHIPPED':
      remainingDays = Math.max(1, 2 - daysSinceOrder); // 2 days from shipping
      break;
    default:
      remainingDays = 7 - daysSinceOrder;
  }
  
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + remainingDays);
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
