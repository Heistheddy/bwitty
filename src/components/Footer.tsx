import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">B</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base sm:text-lg leading-none">BWITTY NG LTD</span>
                <span className="text-xs text-gray-300">Everything Bwitty</span>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Your trusted source for premium hair products, fashion, gadgets, and household essentials. Quality guaranteed, nationwide delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/policies" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-400">Shop Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop/hair-products" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Hair Products
                </Link>
              </li>
              <li>
                <Link to="/shop/clothing" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop/gadgets" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Gadgets & Electronics
                </Link>
              </li>
              <li>
                <Link to="/shop/household" className="text-gray-300 hover:text-yellow-400 transition-colors text-xs sm:text-sm">
                  Household Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-400">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Dr Efosa Osayamwen Close,<br />
                    Cedar Estate, Therra Peace Estate
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">08023170466</p>
                  <p className="text-xs text-gray-400">WhatsApp Available</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                <p className="text-gray-300 text-xs sm:text-sm">bwittyhairs@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Social Media */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-400">Follow us:</span>
              <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/bwittyhairs?igsh=aDZlamJicXdhOHh0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@bwittyhairs?_t=ZS-8yzsgTBd36l&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-current rounded-sm"></div>
              </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-400">We accept:</span>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-white text-black text-xs font-bold rounded">VISA</div>
                <div className="px-2 py-1 bg-white text-black text-xs font-bold rounded">MC</div>
                <div className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">OPay</div>
                <div className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">Bank</div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              &copy; 2025 BWITTY NG LTD. All rights reserved. | 
              <Link to="/policies" className="hover:text-yellow-400 transition-colors ml-1">
                Return & Refund Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;