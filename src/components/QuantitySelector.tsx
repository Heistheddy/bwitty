import React from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddToCart: () => void;
  disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  disabled = false
}) => {
  if (quantity === 0) {
    return (
      <button
        onClick={onAddToCart}
        disabled={disabled}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-pink-500 hover:bg-pink-600 text-black'
        }`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {disabled ? 'Unavailable' : 'Add to Cart'}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={onDecrease}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-medium text-lg min-w-[2rem] text-center">{quantity}</span>
      <button
        onClick={onIncrease}
        className="bg-pink-500 hover:bg-pink-600 text-black w-8 h-8 rounded-full flex items-center justify-center transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;