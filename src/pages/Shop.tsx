import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import CartNotification from '../components/CartNotification';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartNotification, setCartNotification] = useState({
    show: false,
    productName: '',
  });

  useEffect(() => {
    loadProducts();

    // ✅ Realtime sync with admin dashboard
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => loadProducts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_images' },
        () => loadProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    setLoading(true);
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
          product_images!fk_product_images_product (
            id,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  const visibleProducts = sortedProducts.filter(
    (p) =>
      (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (productName: string) => {
    setCartNotification({ show: true, productName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CartNotification
        show={cartNotification.show}
        onClose={() => setCartNotification({ show: false, productName: '' })}
        productName={cartNotification.productName}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Shop <span className="text-pink-500">Our Collection</span>
          </h1>
          <p className="text-gray-600 text-lg">Discover premium products curated just for you</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search products by name or description..."
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm p-5 mb-8 gap-4">
          <span className="text-gray-700 font-medium">
            <span className="text-pink-500 font-bold">{visibleProducts.length}</span> product
            {visibleProducts.length !== 1 ? 's' : ''} available
          </span>
          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-600 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:border-pink-500 focus:outline-none transition-colors cursor-pointer bg-white hover:border-pink-400"
            >
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading products...</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
<ProductCard
  key={product.id}
  product={{
    id: product.id,
    title: product.name || '',
    description: product.description || '',
    price: Number(product.price), // ✅ force number
    image: product.product_images?.[0]?.image_url || '/placeholder.png',
    images: product.product_images?.map((img) => img.image_url) || [],
    inStock: product.stock > 0,
    quantity: 1, // ✅ default for cart
  }}
  onAddToCart={handleAddToCart}
/>

            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No products found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                We couldn't find any products matching your search.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-md"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
