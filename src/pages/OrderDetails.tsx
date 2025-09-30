import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, X, MapPin, CreditCard, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order } from '../data/orders';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details from order context
    setTimeout(() => {
      const foundOrder = getOrderById(orderId || '');
      setOrder(foundOrder || null);
      setLoading(false);
    }, 500);
  }, [orderId, getOrderById]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/account"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Account
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === 'cancelled') {
      return <X className={`w-6 h-6 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />;
    }
    
    if (isActive) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    
    return <Clock className="w-6 h-6 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusSteps = [
    { key: 'pending_payment', label: 'Pending Payment', description: 'Waiting for payment confirmation' },
    { key: 'processing', label: 'Processing', description: 'Order is being prepared' },
    { key: 'shipped', label: 'Shipped', description: 'Order is on its way' },
    { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (order.status === 'cancelled') return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order {order.orderNo}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              
              {order.status === 'cancelled' ? (
                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                  <X className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Order Cancelled</h3>
                    <p className="text-red-700 text-sm">This order has been cancelled</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(step.key, isActive)}
                        </div>
                        <div className="flex-grow">
                          <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </h3>
                          <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-green-600 mt-1">
                              Updated {new Date(order.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`w-px h-8 ml-6 ${isActive ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tracking Information */}
            {order.tracking.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking Information</h2>
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-blue-900">
                      {order.tracking.carrier} - {order.tracking.trackingNumber}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Track your package on the carrier's website
                    </p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Track Package
                  </button>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
              <div className="space-y-4">
                {order.auditLog.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{entry.action}</h3>
                      <p className="text-gray-600 text-sm">{entry.details}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(order.totals.shipping)}</span>
                </div>
                {order.totals.fees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees</span>
                    <span className="font-medium">{formatPrice(order.totals.fees)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(order.totals.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.payment.provider}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize">{order.payment.status}</span>
                    </p>
                  </div>
                </div>
                {order.payment.reference && (
                  <div className="text-sm text-gray-600">
                    <p>Reference: {order.payment.reference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-600">{order.shippingAddress.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-600">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Contact our support team if you have any questions about your order.
              </p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/2348023170466"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp: 08023170466</span>
                </a>
                <a
                  href="mailto:bwittyhairs@gmail.com"
                  className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>bwittyhairs@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;