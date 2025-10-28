import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, /* Building2 */ } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { shippingService } from '../lib/shipping';

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_3b5bcce4bdce01dce992ce6a972caebcf349ed48';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const isLagosState = (state: string): boolean => {
  return state && state.toLowerCase().includes('lagos');
};

const calculateDeliveryPrice = (
  deliveryType: 'standard' | 'express' | 'overnight',
  country: string,
  state: string
): number => {
  if (country && country.toLowerCase() !== 'nigeria') {
    const internationalPrices: Record<string, number> = {
      'united states': 120000,
      'united kingdom': 110000,
      'canada': 115000,
      'ghana': 90000,
      'south africa': 95000,
      'kenya': 95000,
      'united arab emirates': 105000,
      'france': 110000,
      'germany': 110000,
    };

    const countryLower = country.toLowerCase();
    const basePrice = internationalPrices[countryLower] ||
      (85000 + Math.random() * 50000);

    return Math.round(basePrice);
  }

  const isLagos = isLagosState(state);

  if (isLagos) {
    const lagosPrices = {
      standard: 7000,
      express: 14000,
      overnight: 20000
    };
    return lagosPrices[deliveryType];
  }

  return 30000;
};

const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
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

  useEffect(() => {
    const isIntl = formData.country && formData.country.toLowerCase() !== 'nigeria';
    if (isIntl) {
      setShippingMethod('international');
    } else if (shippingMethod === 'international') {
      setShippingMethod('standard');
    }
  }, [formData.country]);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setLoadingAddress(true);
        try {
          const defaultAddress = await shippingService.getDefaultAddress(user.id);

          setFormData({
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: defaultAddress?.phone || user.phone || '',
            address: defaultAddress?.address_line1 || '',
            city: defaultAddress?.city || '',
            state: defaultAddress?.state || '',
            postalCode: defaultAddress?.postal_code || '',
            country: defaultAddress?.country || 'Nigeria',
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
          }));
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    loadUserData();
  }, [user]);

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

  const isInternational = formData.country && formData.country.toLowerCase() !== 'nigeria';

  const shippingOptions: Record<string, { name: string; price: number }> = isInternational
    ? {
        international: {
          name: 'International Shipping',
          price: calculateDeliveryPrice('standard', formData.country, formData.state)
        }
      }
    : {
        standard: {
          name: 'Standard Delivery (5-7 days)',
          price: calculateDeliveryPrice('standard', formData.country, formData.state)
        },
        express: {
          name: 'Express Delivery (2-3 days)',
          price: calculateDeliveryPrice('express', formData.country, formData.state)
        },
        overnight: {
          name: 'Next Day Delivery',
          price: calculateDeliveryPrice('overnight', formData.country, formData.state)
        }
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

  // load Paystack inline script once
  const loadPaystackScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) return resolve();
      if (document.getElementById('paystack-script')) {
        // script already added but not yet available
        const check = setInterval(() => {
          if ((window as any).PaystackPop) {
            clearInterval(check);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          if (!(window as any).PaystackPop) {
            clearInterval(check);
            reject(new Error('Paystack failed to load'));
          }
        }, 5000);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.id = 'paystack-script';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Paystack script failed to load'));
      document.body.appendChild(script);
    });

  const payWithPaystack = async () => {
    try {
      setIsProcessing(true);
      await loadPaystackScript();

      const amountKobo = Math.round(toNum(total) * 100);

      const handler = (window as any).PaystackPop?.setup({
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

       callback: async (response: any) => {
      console.log("PAYSTACK CALLBACK FIRED ✅", response);
  try {
    // ✅ Verify payment on server
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: response.reference }),
    });

    const verifyData = await verifyRes.json();
    console.log("Verification result:", verifyData);

    if (verifyData.success || response.status === 'success') {
      // create order only if payment verified
      const createdId = await createOrder({
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
        shippingMethod:
          shippingOptions[shippingMethod as keyof typeof shippingOptions].name,
        paymentMethod: "paystack",
        paymentReference: response.reference,
        totals: {
          subtotal: toNum(subtotal),
          shipping: toNum(shipping),
          fees: 0,
          grandTotal: toNum(total),
          currency: "NGN",
        },
      });

      dispatch({ type: "CLEAR_CART" });
      navigate(`/order-confirmation/${createdId}`);
    } else {
      alert("Payment not verified. Please contact support.");
    }
  } catch (err: any) {
    console.error("Order creation after payment failed:", err);
    alert(`Order creation failed: ${err.message}. Please contact support with reference: ${response.reference}`);
  } finally {
    setIsProcessing(false);
  }
},

        onClose: () => {
          setIsProcessing(false);
          // user closed payment modal
        },
      });

      // open iframe
      if (handler && typeof handler.openIframe === 'function') {
        handler.openIframe();
      } else {
        // fallback if setup didn't return handler
        console.error('Paystack handler not available');
        setIsProcessing(false);
      }
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
      const createdId = await createOrder({
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

      dispatch({ type: 'CLEAR_CART' });
      navigate(`/order-confirmation/${createdId}`);
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
          <Link to="/shop" className="text-pink-600 hover:text-pink-700">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                {loadingAddress && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                    Loading...
                  </span>
                )}
              </div>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    {formData.country.toLowerCase() === 'nigeria' ? (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Select a state</option>
                        {NIGERIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    )}
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              {isInternational ? (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>International Shipping:</strong> Delivery prices vary by destination.
                    Your shipping cost to {formData.country} is displayed below.
                  </p>
                </div>
              ) : formData.state ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Nigeria Delivery to {formData.state}:</strong>
                    {' '}
                    {isLagosState(formData.state)
                      ? 'Standard: ₦7,000 | Express: ₦14,000 | Next Day: ₦20,000'
                      : 'Flat rate: ₦30,000 for all delivery options'}
                  </p>
                </div>
              ) : null}
              <div className="space-y-3">
                {Object.entries(shippingOptions).map(([key, option]) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-pink-500 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value={key}
                      checked={shippingMethod === key}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="text-pink-500"
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
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-pink-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-pink-500"
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

              {/*   <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-pink-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-pink-500"
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
                      : 'bg-pink-500 hover:bg-pink-600 text-black'
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
