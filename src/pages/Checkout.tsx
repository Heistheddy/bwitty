import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, /* Building2 */ } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import PaystackPop from '@paystack/inline-js';

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_test_6997e09323658f32765ce07f13708f3cfa2bffd8';

const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [isProcessing, setIsProcessing] = useState(false);

  // helper to coerce values safely to numbers
  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPrice = (price: number) => {
    const safe = toNum(price);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(safe);
  };

  // safe totalWeight (defaults each missing value to 0)
  const totalWeight = state.items.reduce(
    (sum: number, item: any) => sum + (toNum(item.weight) * toNum(item.quantity)),
    0
  );

  // shipping options computed using safe numbers
  const shippingOptions: Record<string, { name: string; price: number }> = {
    standard: { name: 'Standard Delivery (5-7 days)', price: Math.max(2500, totalWeight * 500) },
    express: { name: 'Express Delivery (2-3 days)', price: Math.max(5000, totalWeight * 800) },
    overnight: { name: 'Next Day Delivery', price: Math.max(8000, totalWeight * 1200) },
  };

  // compute subtotal safely from cart items (fallback if state.total is missing/invalid)
  const subtotalFromItems = state.items.reduce(
    (sum: number, item: any) => sum + (toNum(item.price) * toNum(item.quantity)),
    0
  );
  const subtotal = toNum(state.total) || subtotalFromItems;

  // choose shipping safely
  const shipping = shippingOptions[shippingMethod as keyof typeof shippingOptions]?.price || 0;

  // final total as numbers
  const total = toNum(subtotal) + toNum(shipping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const payWithPaystack = async () => {
    try {
      setIsProcessing(true);

      const amountKobo = Math.round(toNum(total) * 100);

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: formData.email || '',
        amount: amountKobo,
        currency: 'NGN',
        ref: `bwitty_${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Phone',
              variable_name: 'phone',
              value: formData.phone,
            },
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: `${formData.firstName} ${formData.lastName}`,
            },
          ],
        },

        callback: (response: any) => {
          (async () => {
            try {
              const verifyRes = await fetch("http://localhost:5000/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: response.reference }),
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                const created = await createOrder({
                  items: state.items.map((item: any) => ({
                    productId: item.id,
                    name: item.title,
                    price: toNum(item.price),
                    quantity: toNum(item.quantity),
                    image: item.image,
                  })),
                  shippingAddress: {
                    ...formData,
                    name: ''
                  },
                  shippingMethod:
                    shippingOptions[shippingMethod as keyof typeof shippingOptions].name,
                  paymentMethod: "paystack",
                  payment: {
                    provider: "paystack",
                    status: "paid",
                    reference: response.reference,
                  },
                  totals: {
                    subtotal: toNum(subtotal),
                    shipping: toNum(shipping),
                    fees: 0,
                    grandTotal: toNum(total),
                    currency: "NGN",
                  },
                });

                const createdId = created?.id ?? created;
                dispatch({ type: "CLEAR_CART" });
                navigate(`/order-confirmation/${createdId}`);
              } else {
                alert("Payment not verified. Please contact support.");
              }
            } catch (err) {
              console.error("Order creation after payment failed:", err);
            } finally {
              setIsProcessing(false);
            }
          })();
        },

        onClose: () => {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error('Paystack error:', err);
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (paymentMethod === 'paystack') {
        // start Paystack flow; createOrder will be called in callback on success
        await payWithPaystack();
        return;
      }

      // non-paystack flows: create order immediately
      const created = await createOrder({
        items: state.items.map((item: any) => ({
          productId: item.id,
          name: item.title,
          price: toNum(item.price),
          quantity: toNum(item.quantity),
          image: item.image,
        })),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },
        shippingMethod: shippingOptions[shippingMethod as keyof typeof shippingOptions].name,
        paymentMethod: paymentMethod as 'paystack' | 'cod',
        totals: {
          subtotal: toNum(subtotal),
          shipping: toNum(shipping),
          fees: 0,
          grandTotal: toNum(total),
          currency: 'NGN',
        },
      });

      const createdId = (created && (created.id ?? created)) || created;
      dispatch({ type: 'CLEAR_CART' });
      navigate(`order-confirmation/${createdId}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h1>
          <Link to="/shop" className="text-yellow-600 hover:text-yellow-700">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="08023170466"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Method</h2>
              <div className="space-y-3">
                {Object.entries(shippingOptions).map(([key, option]) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-500 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value={key}
                      checked={shippingMethod === key}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-yellow-500"
                    />
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{option.name}</span>
                        <span className="font-bold text-gray-900">{formatPrice(option.price)}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-yellow-500"
                  />
                  <CreditCard className="ml-3 w-5 h-5 text-gray-500" />
                  <div className="ml-3 flex-grow">
                    <span className="font-medium text-gray-900">Paystack (Card/Bank/OPay)</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded">VISA</div>
                      <div className="px-2 py-1 bg-red-600 text-white text-xs rounded">MC</div>
                    </div>
                  </div>
                </label>

              {/*   <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-yellow-500"
                  />
                  <Building2 className="ml-3 w-5 h-5 text-gray-500" />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">Bank Transfer</span>
                    <p className="text-sm text-gray-600">OPAY: 6105117947</p>
                  </div>
                </label> */}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {state.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">Qty: {toNum(item.quantity)}</p>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      {formatPrice(toNum(item.price) * toNum(item.quantity))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>


              <form onSubmit={handleSubmit} className="mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
                    isProcessing
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Complete Order - ${formatPrice(total)}`}
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Secure checkout powered by Paystack</p>
                <p className="mt-1">Your payment information is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
