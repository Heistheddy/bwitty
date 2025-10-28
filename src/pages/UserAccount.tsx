import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Package, MapPin, Phone, Mail, Calendar, Eye, Truck, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order } from '../data/orders';
import ShippingAddressManager from '../components/ShippingAddressManager';
import UserMessagesSection from '../components/UserMessagesSection';

const UserAccount: React.FC = () => {
  const { user, isAuthenticated, updateProfile, loading } = useAuth();
  const { getUserOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'messages' | 'shipping'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const ordersPerPage = 5;

  useEffect(() => {
    // Fetch user orders from order context
    if (user) {
      const userOrders = getUserOrders(user.id);
      setOrders(userOrders);
    }
  }, [user, getUserOrders]);

  useEffect(() => {
    // Update edit form when user data changes
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const success = await updateProfile(editForm);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-pink-100 text-pink-800';
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-pink-100 text-pink-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cod':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and orders</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 sm:space-x-8 sm:gap-0">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'shipping', label: 'Shipping', icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeTab === id
                    ? 'bg-pink-500 text-black'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                      isUpdating
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-pink-500 hover:bg-pink-600 text-black'
                    }`}
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        phone: user?.phone || '',
                      });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-gray-900 text-sm sm:text-base">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-gray-900 text-sm sm:text-base">{user?.email}</span>
                      {user?.emailVerified ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-gray-900 text-sm sm:text-base">{user?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-gray-900 text-sm sm:text-base">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <Link
                        to="/change-email"
                        className="block w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Change Email
                      </Link>
                      <Link
                        to="/change-password"
                        className="block w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Change Password
                      </Link>
                      {!user?.emailVerified && (
                        <button className="block w-full text-left p-3 border border-pink-300 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-sm sm:text-base">
                          Resend Verification Email
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Manage Addresses</h3>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1" />
                        <div className="text-gray-600 text-sm sm:text-base">
                          <p>Manage your shipping addresses</p>
                          <button
                            onClick={() => setActiveTab('shipping')}
                            className="text-pink-600 hover:text-pink-700 text-xs sm:text-sm mt-1 font-medium"
                          >
                            Go to Shipping Addresses
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h2>
                <span className="text-gray-600 text-sm sm:text-base">{orders.length} total orders</span>
              </div>

              {currentOrders.length > 0 ? (
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Order {order.orderNo}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment.status)}`}>
                            {order.payment.status.toUpperCase()}
                          </span>
                          <Link
                            to={`/account/orders/${order.id}`}
                            className="inline-flex items-center text-pink-600 hover:text-pink-700 text-xs sm:text-sm font-medium"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Items</p>
                          <p className="font-medium text-sm sm:text-base">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Total</p>
                          <p className="font-medium text-sm sm:text-base">{formatPrice(order.totals.grandTotal)}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium capitalize text-sm sm:text-base">{order.payment.provider}</p>
                        </div>
                      </div>

                      {order.tracking.trackingNumber && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-900">
                              Tracking: {order.tracking.trackingNumber}
                            </p>
                            <p className="text-xs text-blue-700">
                              Carrier: {order.tracking.carrier}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                            />
                            <span className="truncate max-w-20 sm:max-w-32">{item.name}</span>
                            <span>×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs sm:text-sm text-gray-500">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">Start shopping to see your orders here</p>
                  <Link
                    to="/shop"
                    className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-pink-500 text-black border-pink-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && user && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <UserMessagesSection userId={user.id} />
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && user && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <ShippingAddressManager userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;