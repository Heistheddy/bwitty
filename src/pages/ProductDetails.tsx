import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Truck, Shield, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { productService, DatabaseProduct, ProductImage, supabase, subscribeToProducts } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ImageCarousel from '../components/ImageCarousel';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<(DatabaseProduct & { product_images: ProductImage[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  // Subscribe to realtime changes
  useEffect(() => {
    const subscription = subscribeToProducts((payload) => {
      console.log('Product detail realtime update:', payload);
      
      // Only reload if this product was affected
      if (id && (payload.new?.id === id || payload.old?.id === id)) {
        loadProduct();
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data: productData, error } = await supabase
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
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setProduct(null);
          return;
        }
        throw error;
      }
      
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-yellow-600 hover:text-yellow-700">
            Return to Shop
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          title: product.name,
          price: product.price,
          image: product.product_images && product.product_images.length > 0 
            ? product.product_images[0].image_url 
            : '/placeholder.png',
          weight: 1, // Default weight
        },
      });
    }
  };

  // Get product images for carousel
  const productImages = product.product_images?.map(img => img.image_url) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/shop" className="text-gray-500 hover:text-gray-700">Shop</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <ImageCarousel 
              images={productImages}
              productName={product.name}
              showThumbnails={true}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(4.5) // Default rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">(0 reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600">{product.description || 'No description available.'}</p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">Weight:</span>
                <span className="ml-2 text-gray-600">1kg</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Availability:</span>
                <span className={`ml-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">SKU:</span>
                <span className="ml-2 text-gray-600">BWY-{product.id}</span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-900">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-600">Nationwide shipping</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More Products</h2>
          <div className="text-center py-8">
            <Link
              to="/shop"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;