export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  fees: number;
  grandTotal: number;
  currency: string;
}

export interface PaymentInfo {
  status: 'pending' | 'paid' | 'failed' | 'cod';
  provider: 'paystack' | 'opay' | 'cod';
  reference?: string;
  authorization?: string;
  channel?: string;
  fees?: number;
}

export interface TrackingInfo {
  carrier?: 'UPS' | 'USPS' | 'FedEx' | 'DHL' | 'Other';
  trackingNumber?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totals: OrderTotals;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  tracking: TrackingInfo;
  payment: PaymentInfo;
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  auditLog: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

// Generate unique order number
export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `BW-${dateStr}-${random}`;
};

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'BW-20250115-A1B2C3',
    userId: '2',
    customerName: 'Adunni Okafor',
    customerEmail: 'adunni@email.com',
    items: [
      {
        productId: '1',
        name: 'Premium Brazilian Deep Wave Wig',
        price: 45000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'
      }
    ],
    totals: {
      subtotal: 45000,
      shipping: 2500,
      fees: 0,
      grandTotal: 47500,
      currency: 'NGN'
    },
    shippingAddress: {
      name: 'Adunni Okafor',
      phone: '08012345678',
      address: '123 Lagos Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      postalCode: '100001'
    },
    shippingMethod: 'UPS Standard',
    tracking: {
      carrier: 'UPS',
      trackingNumber: '1Z999AA1234567890'
    },
    payment: {
      status: 'paid',
      provider: 'paystack',
      reference: 'T_12345678901234567890',
      channel: 'card'
    },
    status: 'shipped',
    auditLog: [
      {
        id: '1',
        action: 'Order Created',
        details: 'Order placed successfully',
        timestamp: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        action: 'Payment Confirmed',
        details: 'Payment verified via Paystack',
        timestamp: '2025-01-15T10:05:00Z'
      },
      {
        id: '3',
        action: 'Status Updated',
        details: 'Status changed to Processing',
        timestamp: '2025-01-15T10:10:00Z'
      },
      {
        id: '4',
        action: 'Status Updated',
        details: 'Status changed to Shipped. Tracking: 1Z999AA1234567890',
        timestamp: '2025-01-16T14:30:00Z'
      }
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-16T14:30:00Z'
  },
  {
    id: '2',
    orderNo: 'BW-20250114-X9Y8Z7',
    userId: '3',
    customerName: 'Emeka Johnson',
    customerEmail: 'emeka@email.com',
    items: [
      {
        productId: '2',
        name: 'Curly Hair Extensions Bundle',
        price: 28000,
        quantity: 1,
        image: 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg'
      }
    ],
    totals: {
      subtotal: 28000,
      shipping: 2500,
      fees: 0,
      grandTotal: 30500,
      currency: 'NGN'
    },
    shippingAddress: {
      name: 'Emeka Johnson',
      phone: '08087654321',
      address: '456 Abuja Road',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      postalCode: '900001'
    },
    shippingMethod: 'FedEx Express',
    tracking: {
      carrier: 'FedEx'
    },
    payment: {
      status: 'paid',
      provider: 'opay',
      reference: 'OP_98765432109876543210'
    },
    status: 'processing',
    auditLog: [
      {
        id: '1',
        action: 'Order Created',
        details: 'Order placed successfully',
        timestamp: '2025-01-14T15:30:00Z'
      },
      {
        id: '2',
        action: 'Payment Confirmed',
        details: 'Payment verified via OPay',
        timestamp: '2025-01-14T15:35:00Z'
      },
      {
        id: '3',
        action: 'Status Updated',
        details: 'Status changed to Processing',
        timestamp: '2025-01-14T15:40:00Z'
      }
    ],
    createdAt: '2025-01-14T15:30:00Z',
    updatedAt: '2025-01-14T15:40:00Z'
  }
];