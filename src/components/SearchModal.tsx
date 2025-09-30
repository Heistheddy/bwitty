import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { products } from '../data/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(products.slice(0, 6)); // Show some products initially

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8); // Limit to 8 results
      setSearchResults(filtered);
    } else {
      setSearchResults(products.slice(0, 6)); // Show featured products when no search
    }
  }, [searchTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to shop page with search term
      window.location.href = `/shop?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </form>
        </div>

        {/* Search Results */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchTerm ? `Results for "${searchTerm}"` : 'Featured Products'}
                </h3>
                {searchTerm && (
                  <Link
                    to={`/shop?search=${encodeURIComponent(searchTerm)}`}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                    onClick={onClose}
                  >
                    View all results
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{product.subcategory}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try searching with different keywords</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Quick search:</span>
            {['wigs', 'extensions', 'clothing', 'gadgets'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchTerm(term)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;