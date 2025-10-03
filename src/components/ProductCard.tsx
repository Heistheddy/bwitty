import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import QuantitySelector from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { state, dispatch } = useCart();
  const [localQuantity, setLocalQuantity] = useState(0);

  // Get current quantity in cart
  const cartItem = state.items.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : localQuantity;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        weight: product.weight,
      },
    });
    setLocalQuantity(1);
    if (onAddToCart) {
      onAddToCart(product.title);
    }
  };

  const handleIncrease = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        weight: product.weight,
      },
    });
    if (!cartItem) {
      setLocalQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        dispatch({
          type: 'UPDATE_QUANTITY',
          payload: { id: product.id, quantity: cartItem.quantity - 1 },
        });
      } else {
        dispatch({ type: 'REMOVE_FROM_CART', payload: product.id });
      }
    } else {
      setLocalQuantity(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
              SALE
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">OUT OF STOCK</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-pink-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({product.reviews} reviews)
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-red-500 text-sm font-medium">Out of Stock</span>
          )}
        </div>
        
        <QuantitySelector
          quantity={currentQuantity}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onAddToCart={handleAddToCart}
          disabled={!product.inStock}
        />
      </div>
    </div>
  );
};

export default ProductCard;