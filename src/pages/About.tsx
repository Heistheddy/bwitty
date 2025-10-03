import React from 'react';
import { Heart, Star, Users, Award, Phone, Instagram } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-pink-400">BWITTY NG LTD</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Your trusted partner for premium hair products and more. 
            We're committed to delivering quality and style that transforms your everyday life.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="w-16 h-1 bg-pink-500 mx-auto mb-6"></div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                At Bwitty NG Ltd, we believe that every customer deserves more than just services 
                — they deserve reliability, peace of mind, and solutions that turn visions into reality. 
                Founded under the leadership of Blessing Unuigboje Anderson, our company is built on 
                the core values of trust, professionalism, and a commitment to achieving our customers’ 
                dreams.
              </p>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                We specialize in providing reliable and seamless business solutions that empower 
                individuals and organizations to grow and thrive. Our approach is centered on 
                peace of mind, ensuring that every client feels confident and secure while working 
                with us.
              </p>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you are partnering with us for wholesale services, individualpurchase, 
                or long-term purchases, Bwitty NG Ltd is dedicated to walking with you every 
                step of the way. We don’t just offer services — we deliver excellence, foster 
                trust, and build lasting relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              " To provide reliable services that bring peace of mind while helping 
              our customers achieve their dreams"
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                Delivering the best services with consistency and integrity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Focus</h3>
              <p className="text-gray-600">
                Creating a peaceful experience where customers feel valued, respected, and supported.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                Building a foundation of reliability and trust in every transaction.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust</h3>
              <p className="text-gray-600">
                We build lasting relationships with our customers through transparency, reliability, 
                and consistent delivery on our promises.
              </p>
            </div>
          </div>
        </div>
      </section>

 {/*      {/* Product Categories }
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive range of premium products across multiple categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hair Products</h3>
                <p className="text-gray-600 text-sm">
                  Premium human hair wigs, extensions, closures, and frontals for every style and occasion.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-pink-400 to-pink-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fashion & Clothing</h3>
                <p className="text-gray-600 text-sm">
                  African prints, modern fashion pieces, and traditional wear that celebrates style and culture.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gadgets & Electronics</h3>
                <p className="text-gray-600 text-sm">
                  Latest tech gadgets, accessories, and electronic devices to enhance your digital lifestyle.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Household Items</h3>
                <p className="text-gray-600 text-sm">
                  Essential items for your home, kitchen tools, decor, and everything you need for comfortable living.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-300 mb-8 text-lg">
              We'd love to hear from you. Whether you have questions about our products, need styling advice, 
              or want to share feedback, our team is here to help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div>
                <h3 className="text-xl font-semibold text-pink-400 mb-3">Visit Our Store</h3>
                <p className="text-gray-300 text-sm">
                  Dr Efosa Osayamwen Close<br />
                  Cedar Estate, Therra Peace Estate
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-pink-400 mb-3">Contact Us</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Phone/WhatsApp: 08023170466
                </p>
                <p className="text-gray-300 text-sm">
                  Email: bwittyhairs@gmail.com
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-pink-400 mb-3">Follow Us</h3>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://www.instagram.com/bwittyhairs?igsh=aDZlamJicXdhOHh0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@bwittyhairs?_t=ZS-8yzsgTBd36l&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-pink-400 transition-colors"
                  >
                    <div className="w-6 h-6 bg-current rounded"></div>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/2348023170466"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <Phone className="mr-2 w-5 h-5" />
                WhatsApp Us
              </a>
              <a
                href="mailto:bwittyhairs@gmail.com"
                className="bg-pink-500 hover:bg-pink-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;