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
    <div className="min-h-screen bg-gray-50">
      <CartNotification
        show={cartNotification.show}
        onClose={() => setCartNotification({ show: false, productName: '' })}
        productName={cartNotification.productName}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-1">Discover our complete product range</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search products by name or description..."
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-6">
          <span className="text-gray-600">
            {visibleProducts.length} product
            {visibleProducts.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-pink-500 hover:bg-pink-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
