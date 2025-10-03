import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Truck, Package, CreditCard, Phone } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-gray-600">Order Number:</span>
                <p className="font-semibold text-gray-900">{orderId}</p>
              </div>
              <div>
                <span className="text-gray-600">Order Date:</span>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-NG')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <p className="font-semibold text-green-600">Confirmed</p>
              </div>
              <div>
                <span className="text-gray-600">Delivery Status:</span>
                <p className="font-semibold text-pink-600">Processing</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Package className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Order Processing</h3>
                  <p className="text-gray-600 text-sm">
                    We're preparing your items for shipment. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Shipping</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive a tracking number via email once your order ships.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Delivery</h3>
                  <p className="text-gray-600 text-sm">
                    Your order will be delivered to your specified address within the estimated timeframe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-pink-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your order, don't hesitate to contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/2348023170466"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp: 08023170466
              </a>
              <a
                href="mailto:bwittyhairs@gmail.com"
                className="inline-flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Email: bwittyhairs@gmail.com
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Print Order Details
            </button>
          </div>

          {/* Order Reference */}
          <div className="mt-8 text-xs text-gray-500">
            <p>Keep this order number for your records: <strong>{orderId}</strong></p>
            <p>A confirmation email has been sent to your registered email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;