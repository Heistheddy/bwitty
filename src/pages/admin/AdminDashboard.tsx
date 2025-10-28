import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, Plus, CreditCard as Edit, Trash2, Search, Upload, Image as ImageIcon, LogOut, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productService, DatabaseProduct, ProductImage, supabase } from '../../lib/supabase';
import { useOrders } from '../../context/OrderContext';
import MessageModal from '../../components/MessageModal';
import ImageCarousel from '../../components/ImageCarousel';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../hooks/use-toast';
import { subscribeToProducts } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { isAdmin, logout, loading } = useAuth();
  const { orders, updateOrderStatus, addTracking, loading: ordersLoading } = useOrders();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<(DatabaseProduct & { product_images: ProductImage[] })[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<(DatabaseProduct & { product_images: ProductImage[] }) | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    orderId: '',
    recipientId: '',
    recipientName: '',
    orderNo: '',
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default' as 'default' | 'destructive',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Load products when component mounts or products tab is selected
  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'overview') {
      loadProducts();
    }
  }, [activeTab]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!isAdmin) return;
    
    const subscription = subscribeToProducts((payload) => {
      console.log('Realtime update:', payload);
      // Reload products when changes occur
      if (activeTab === 'products' || activeTab === 'overview') {
        loadProducts();
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [activeTab, isAdmin]);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock,
          created_at,
          updated_at,
          product_images!fk_product_images_product (
            id,
            product_id,
            image_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

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

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'category':
        aValue = (a.category || '').toLowerCase();
        bValue = (b.category || '').toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.filter(order => order.payment.status === 'paid').reduce((sum, order) => sum + order.totals.grandTotal, 0),
    pendingOrders: orders.filter(order => order.status === 'processing' || order.status === 'pending_payment').length,
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      description: 'Are you sure you want to delete this product? This will also delete all associated images. This action cannot be undone.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await productService.delete(productId);
          
          // Update local state immediately
          setProducts(prev => prev.filter(p => p.id !== productId));
          
          toast({
            title: "Success",
            description: "Product deleted successfully",
            variant: "default",
          });
        } catch (error) {
          console.error('Error deleting product:', error);
          toast({
            title: "Error",
            description: "Failed to delete product",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      variant: 'destructive'
    });
  };

  const handleEditProduct = async (product: DatabaseProduct) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSaveProduct = async (productData: Partial<DatabaseProduct & { product_images: ProductImage[] }>, imageFiles?: File[]) => {
    try {
      if (editingProduct) {
        // Edit existing product
        // Use helper function to only send defined fields
        const payload = productService.pickDefined({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          is_active: productData.is_active
        });

        if (Object.keys(payload).length === 0) {
          toast({
            title: "No changes detected",
            description: "Please modify at least one field to update the product.",
          });
          return;
        }

        const updatedProduct = await productService.update(editingProduct.id, payload);
        
        // Update local state immediately
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...updatedProduct }
            : p
        ));
        
        // Handle new images
        if (imageFiles && imageFiles.length > 0) {
          for (const file of imageFiles) {
            const imageUrl = await productService.uploadImage(file, editingProduct.id);
            await productService.addProductImage(editingProduct.id, imageUrl);
          }
          // Reload products to get updated images
          await loadProducts();
        }
        
        toast({
          title: "Success",
          description: "Product updated successfully.",
          variant: "success",
        });
      } else {
        // Add new product
        const newProduct = await productService.create({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || 0,
          stock: productData.stock || 0
        });
        
        // Handle new images
        if (imageFiles && imageFiles.length > 0) {
          for (const file of imageFiles) {
            const imageUrl = await productService.uploadImage(file, newProduct.id);
            await productService.addProductImage(newProduct.id, imageUrl);
          }
        }
        
        // Add to local state immediately
        await loadProducts();
        toast({
          title: "Success",
          description: "Product added successfully.",
          variant: "success",
        });
      }
      
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProductImage = async (productId: string, imageId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Image',
      description: 'Are you sure you want to delete this image? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await productService.deleteProductImage(imageId);
          
          // Update local state immediately - remove the image from the product
          setProducts(prev => prev.map(product => 
            product.id === productId 
              ? {
                  ...product,
                  product_images: product.product_images.filter(img => img.id !== imageId)
                }
              : product
          ));
          
          toast({
            title: "Success",
            description: "Image deleted successfully",
            variant: "success",
          });
        } catch (error) {
          console.error('Error deleting image:', error);
          toast({
            title: "Error",
            description: "Failed to delete image",
            variant: "destructive",
          });
        }
      }
    });
  };


  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleMessageCustomer = (order: any) => {
    setMessageModal({
      show: true,
      orderId: order.id,
      recipientId: order.userId,
      recipientName: order.customerName,
      orderNo: order.orderNo,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-black text-base sm:text-lg leading-none">BWITTY NG</span>
                  <span className="text-xs text-gray-600">Admin Dashboard</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 sm:space-x-8 sm:gap-0">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
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
            <Link
              to="/admin/messages"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Messages</span>
            </Link>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {formatPrice(stats.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order No
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Payment Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {order.orderNo}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                          <div>
                            <div className="font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {formatPrice(order.totals.grandTotal)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment.status === 'pending' ? 'bg-pink-100 text-pink-800' :
                            order.payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pending_payment' ? 'bg-pink-100 text-pink-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add Product</span>
                </button>
                <Link
                  to="/change-password"
                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors text-sm sm:text-base"
                >
                  <span>Change Password</span>
                </Link>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="created_at">Date Created</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {productsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Stock
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-gray-100">
                            {product.product_images?.[0]?.image_url ? (
                              <img
                                src={product.product_images[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900 max-w-32 sm:max-w-xs truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 max-w-32 sm:max-w-xs truncate hidden sm:block">
                              {product.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900">{product.stock} units</div>
                          <div className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h1>
              <div className="text-xs sm:text-sm text-gray-600">
                {orders.length} total orders
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order No
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Payment Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fulfillment Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Created At
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="text-pink-600 hover:text-pink-700 font-medium"
                          >
                            {order.orderNo}
                          </button>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {formatPrice(order.totals.grandTotal)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment.status === 'pending' ? 'bg-pink-100 text-pink-800' :
                            order.payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs border border-gray-300 rounded px-1 sm:px-2 py-1 w-full sm:w-auto"
                          >
                            <option value="pending_payment">Pending Payment</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleMessageCustomer(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Message
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Order {selectedOrder.orderNo}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total:</strong> {formatPrice(selectedOrder.totals.grandTotal)}</p>
                    <p><strong>Payment:</strong> {selectedOrder.payment.provider} ({selectedOrder.payment.status})</p>
                    <p><strong>Status:</strong> {selectedOrder.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Product Images Preview */}
              {selectedOrder.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Product Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowOrderDetails(false);
                    handleMessageCustomer(selectedOrder);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Message Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.show}
        onClose={() => setMessageModal({ ...messageModal, show: false })}
        orderId={messageModal.orderId}
        recipientId={messageModal.recipientId}
        recipientName={messageModal.recipientName}
        orderNo={messageModal.orderNo}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

// Product Form Component
const ProductForm: React.FC<{
  product: (DatabaseProduct & { product_images: ProductImage[] }) | null;
  onSave: (product: Partial<DatabaseProduct & { product_images: ProductImage[] }>, imageFiles?: File[]) => void;
  onCancel: () => void;
}> = ({ product, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setNewImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteProductImage = async (imageId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Image',
      description: 'Are you sure you want to delete this image? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await productService.deleteProductImage(imageId);
          toast({
            title: "Success",
            description: "Image deleted successfully.",
            variant: "success",
          });
          // Refresh the form by reloading the product data
          if (product) {
            window.location.reload(); // Simple refresh for now
          }
        } catch (error) {
          console.error('Error deleting image:', error);
          toast({
            title: "Error",
            description: "Failed to delete image. Please try again.",
            variant: "destructive",
          });
        }
      }
    });
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData, newImageFiles.length > 0 ? newImageFiles : undefined);
      // Refresh products list to show updated thumbnails
      if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/dashboard')) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing Images */}
        {product && product.product_images && product.product_images.length > 0 && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Current Images</label>
            <div className="mb-4">
              <ImageCarousel 
                images={product.product_images.map(img => img.image_url)}
                productName={product.name}
                showThumbnails={product.product_images.length > 1}
                className="max-w-sm"
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.product_images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt="Product thumbnail"
                    className="w-full h-16 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProductImage(image.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Preview */}
        {newImagePreviews.length > 0 && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">New Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Add Images</label>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Choose Images
            </label>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each. Multiple files allowed.</p>
          </div>
        </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          placeholder="Enter product name"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          placeholder="Enter product description"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          required
          min="0"
          step="0.01"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          required
          min="0"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          placeholder="0"
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base ${
            isSubmitting
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 text-black'
          }`}
        >
          {isSubmitting ? 'Saving...' : (product ? 'Update' : 'Add')} Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </form>
    
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default AdminDashboard;