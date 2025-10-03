import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  // ✅ Safely recalc subtotal & shipping
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalWeight = state.items.reduce(
    (sum, item) => sum + ((item.weight || 0) * item.quantity),
    0
  );

  const shippingEstimate = 2500;
  const actualShipping = Math.max(shippingEstimate, totalWeight * 500);
  const total = subtotal + actualShipping;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/shop"
            className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {state.itemCount} item{state.itemCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">Weight: {item.weight || 0}kg each</p>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link
                to="/shop"
                className="text-pink-600 hover:text-pink-700 font-medium inline-flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping ({totalWeight}kg)</span>
                  <span className="font-medium">{formatPrice(actualShipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-4 rounded-lg transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => dispatch({ type: 'CLEAR_CART' })}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Shipping Info + Bank Info remain unchanged */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
