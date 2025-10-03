import React from 'react';
import { useState, useEffect } from 'react';
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-pink-200">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
              SALE
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg bg-black bg-opacity-50 px-4 py-2 rounded-lg">OUT OF STOCK</span>
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImageIndex === index ? 'bg-white w-4' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2 text-lg">
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
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-red-500 text-sm font-semibold bg-red-50 px-2 py-1 rounded">Out of Stock</span>
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