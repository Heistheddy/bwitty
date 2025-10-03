import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Phone } from 'lucide-react';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import CartNotification from '../components/CartNotification';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, isSupabaseUuid } from '../lib/supabase';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [cartNotification, setCartNotification] = useState({
    show: false,
    productName: '',
  });

  const featuredProducts = products.filter(p => p.featured).slice(0, 6);

  const handleAddToCart = (productName: string) => {
    setCartNotification({
      show: true,
      productName,
    });
  };

  return (
    <div className="min-h-screen">
      <CartNotification
        show={cartNotification.show}
        onClose={() => setCartNotification({ show: false, productName: '' })}
        productName={cartNotification.productName}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-pink-400">BWITTY NG LTD</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Everything Bwitty - Your Trusted Source for Premium Hair Products, Fashion & More
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/shop"
                className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-4 px-8 rounded-lg transition-colors flex items-center"
              >
                Shop Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/2348023170466"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black font-bold py-4 px-8 rounded-lg transition-colors flex items-center"
              >
                <Phone className="mr-2 w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Nationwide delivery with multiple shipping options including UPS, FedEx, DHL</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">Premium products with comprehensive return and refund policy</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">Trusted by thousands of customers across Nigeria</p>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check out our most popular and trending products
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
            >
              View All Products <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help or Have Questions?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our friendly customer service team is ready to assist you with any inquiries about our products or services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/2348023170466"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <Phone className="mr-2 w-5 h-5" />
              WhatsApp: 08023170466
            </a>
            <a
              href="mailto:bwittyhairs@gmail.com"
              className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Email: bwittyhairs@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;