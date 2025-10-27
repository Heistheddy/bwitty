import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, DatabaseOrder, isSupabaseUuid } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: 'paystack' | 'opay' | 'cod';
  paymentReference?: string;
  totals: {
    subtotal: number;
    shipping: number;
    fees: number;
    grandTotal: number;
    currency: string;
  };
}

interface Order {
  id: string;
  orderNo: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    fees: number;
    grandTotal: number;
    currency: string;
  };
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  tracking: {
    carrier?: string;
    trackingNumber?: string;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'cod';
    provider: 'paystack' | 'opay' | 'cod';
    reference?: string;
  };
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  auditLog: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: CreateOrderData) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addTracking: (orderId: string, carrier: string, trackingNumber: string) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | null;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: false,
  createOrder: async () => '',
  updateOrderStatus: async () => {},
  addTracking: async () => {},
  getUserOrders: () => [],
  getOrderById: () => null,
  refreshOrders: async () => {},
});

// Generate unique order number
const generateOrderNumber = (): string => {
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

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load orders from localStorage on component mount
  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
    else {
      // Clear orders when user logs out
      setOrders([]);
    }
  }, [user]);

  const loadOrdersFromStorage = () => {
    try {
      const savedOrders = localStorage.getItem('bwitty-orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      setOrders([]);
    }
  };

  const refreshOrders = async () => {
    if (!user) return;
    
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase is not configured. Orders will not be available.');
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('orders').select('*');
      
      // If not admin, only get user's orders
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      const formattedOrders: Order[] = (data || []).map((dbOrder: any) => ({
        id: dbOrder.id,
        orderNo: dbOrder.order_no,
        userId: dbOrder.user_id,
        customerName: dbOrder.customer_name,
        customerEmail: dbOrder.customer_email,
        items: dbOrder.items,
        totals: dbOrder.totals,
        shippingAddress: dbOrder.shipping_address,
        shippingMethod: dbOrder.shipping_method || '',
        tracking: dbOrder.tracking,
        payment: dbOrder.payment,
        status: dbOrder.status,
        auditLog: dbOrder.audit_log,
        createdAt: dbOrder.created_at,
        updatedAt: dbOrder.updated_at,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error in refreshOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData): Promise<string> => {
    if (!user) throw new Error('User must be authenticated to create order');
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Cannot create order.');
    }
    
    const orderNo = generateOrderNumber();
    const orderId = crypto.randomUUID();

    const auditLog = [
      {
        id: '1',
        action: 'Order Created',
        details: 'Order placed successfully',
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      }
    ];

    const dbOrder = {
      id: orderId,
      order_no: orderNo,
      user_id: user.id,
      customer_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      customer_email: user.email,
      items: orderData.items,
      totals: orderData.totals,
      shipping_address: orderData.shippingAddress,
      shipping_method: orderData.shippingMethod,
      tracking: {},
      payment: {
        status: orderData.paymentMethod === 'cod' ? 'cod' : 'pending',
        provider: orderData.paymentMethod,
        reference: orderData.paymentReference || null,
      },
      status: orderData.paymentMethod === 'cod' ? 'processing' : 'pending_payment',
      audit_log: auditLog,
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
      }

      // Refresh orders to get the latest data
      await refreshOrders();
      
      return data.id;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can update order status');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Cannot update order.');
    }

    // Get current order to update audit log
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const newAuditEntry = {
      id: Date.now().toString(),
      action: 'Status Updated',
      details: `Status changed to ${status.replace('_', ' ')}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'
    };

    const updatedAuditLog = [...currentOrder.auditLog, newAuditEntry];

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          audit_log: updatedAuditLog,
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Refresh orders to get the latest data
      await refreshOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const addTracking = async (orderId: string, carrier: string, trackingNumber: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can add tracking');
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Cannot add tracking.');
    }

    // Get current order to update audit log
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const newAuditEntry = {
      id: Date.now().toString(),
      action: 'Tracking Added',
      details: `Tracking number ${trackingNumber} added for ${carrier}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'
    };

    const updatedAuditLog = [...currentOrder.auditLog, newAuditEntry];

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking: { carrier, trackingNumber },
          audit_log: updatedAuditLog,
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error adding tracking:', error);
        throw error;
      }

      // Refresh orders to get the latest data
      await refreshOrders();
    } catch (error) {
      console.error('Error adding tracking:', error);
      throw error;
    }
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const getOrderById = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      createOrder,
      updateOrderStatus,
      addTracking,
      getUserOrders,
      getOrderById,
      refreshOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};