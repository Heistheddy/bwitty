import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface CartNotificationProps {
  show: boolean;
  onClose: () => void;
  productName: string;
}

const CartNotification: React.FC<CartNotificationProps> = ({ show, onClose, productName }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <div className="flex-grow">
          <p className="font-medium">Added to cart!</p>
          <p className="text-sm opacity-90 truncate">{productName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartNotification;