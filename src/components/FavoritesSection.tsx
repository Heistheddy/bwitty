import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { favoriteService } from '../lib/favorites';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  product_images: Array<{ image_url: string }>;
}

interface FavoritesSectionProps {
  userId: string;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ userId }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { dispatch } = useCart();

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteIds = await favoriteService.getUserFavoriteIds(userId);

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          category,
          product_images (image_url)
        `)
        .in('id', favoriteIds);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Loaded favorites:', products);
      setFavorites(products || []);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      toast({
        title: 'Error Loading Favorites',
        description: error.message || 'Failed to load favorites. Please check database permissions.',
        variant: 'destructive',
      });
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      setRemovingId(productId);
      await favoriteService.removeFromFavorites(productId, userId);

      setFavorites(prev => prev.filter(p => p.id !== productId));

      toast({
        title: 'Removed from Favorites',
        description: 'Product removed from your favorites',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    const imageUrl = product.product_images?.[0]?.image_url || '';
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.name,
        price: product.price,
        image: imageUrl,
        quantity: 1,
        weight: 0.5,
      },
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
        <p className="text-gray-600 mb-6">
          Start adding products to your favorites to see them here
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center bg-pink-500 hover:bg-pink-600 text-black font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Browse Products
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          My Favorites ({favorites.length})
        </h2>
        <p className="text-gray-600 mt-1">Products you've saved for later</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/product/${product.id}`} className="block">
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.product_images?.[0]?.image_url || ''}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mb-1 hover:text-pink-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-pink-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>

                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  disabled={removingId === product.id}
                  className={`flex items-center justify-center border border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600 p-2 rounded-lg transition-colors ${
                    removingId === product.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Remove from favorites"
                >
                  {removingId === product.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesSection;
