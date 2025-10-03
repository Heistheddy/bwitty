import React from 'react';
import { Shield, Clock, Package, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

const Policies: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Return & Refund Policy</h1>
          <p className="text-xl text-gray-200">
            Our comprehensive policy to ensure your satisfaction and peace of mind
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Policy Overview */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <Shield className="w-8 h-8 text-pink-500 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Overview</h2>
                <p className="text-gray-600">
                  At BWITTY NG LTD, we stand behind the quality of our products and are committed to 
                  ensuring your complete satisfaction. Our return and refund policy is designed to be 
                  fair, transparent, and customer-friendly.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <Clock className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">24-48 hours Window</h3>
                <p className="text-sm text-gray-600">Return items within 24-48 hours of delivery</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Original Condition</h3>
                <p className="text-sm text-gray-600">Items must be unused and in original packaging</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Full Refunds</h3>
                <p className="text-sm text-gray-600">Complete refund for eligible returns</p>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Conditions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Eligible for Return
                </h3>
                <ul className="space-y-2 text-gray-600 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Items returned within  <strong>  24-48 hours </strong>   of delivery date
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Products in  <strong> original, unused condition </strong> with all tags and packaging
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Items that do not match the product description on our website
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Defective or damaged items received due to shipping or manufacturing issues
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Wrong items sent due to our fulfillment error
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Not Eligible for Return
                </h3>
                <ul className="space-y-2 text-gray-600 ml-7">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Hair products</strong> that have been opened, used, cut, colored, or styled
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Items returned after the <strong>24-48 hours</strong> return window
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Products without original packaging, tags, or documentation
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Underwear, intimate apparel,</strong> or personal hygiene items for health and safety reasons
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Items that show signs of wear, damage from misuse, or normal wear and tear
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Sale items marked as <strong>"Final Sale"</strong> or clearance products
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Return Process */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return an Item</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Customer Service</h3>
                  <p className="text-gray-600 mb-2">
                    Reach out to us within 24-48 hours of receiving your order through:
                  </p>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4">
                    <li>• WhatsApp: <strong>08023170466</strong></li>
                    <li>• Email: <strong>bwittyhairs@gmail.com</strong></li>
                    <li>• Contact form on our website</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Provide Order Information</h3>
                  <p className="text-gray-600">
                    Please have your order number, reason for return, and photos of the item (if applicable) ready. 
                    This helps us process your request faster.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Receive Return Authorization</h3>
                  <p className="text-gray-600">
                    Our team will review your request and provide you with return instructions and 
                    a return authorization number if your return is approved.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Package & Ship the Item</h3>
                  <p className="text-gray-600">
                    Securely package the item in its original packaging with all accessories, manuals, 
                    and documentation. Ship to the address provided in your return authorization.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Receive Your Refund</h3>
                  <p className="text-gray-600">
                    Once we receive and inspect your returned item, we'll process your refund within 
                    <strong> 5-7 business days</strong> to your original payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Refund Timeline</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Processing:</strong> 2-3 business days after we receive your return
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Bank Transfer:</strong> 1-2 business days
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Credit Card:</strong> 3-5 business days
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <strong>Mobile Money:</strong> 1-3 business days
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What's Refunded</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    Full product price
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    Original shipping costs (for defective items)
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-1 mr-3 flex-shrink-0" />
                    Return shipping costs (customer responsibility)
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-1 mr-3 flex-shrink-0" />
                    Express shipping upgrades (non-refundable)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Exchanges */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Exchanges</h2>
            <p className="text-gray-600 mb-4">
              Currently, we do not offer direct exchanges. If you need a different size, color, or style:
            </p>
            <ol className="space-y-2 text-gray-600 ml-4">
              <li className="flex items-start">
                <span className="font-bold text-pink-500 mr-3">1.</span>
                Return your original item following our return process
              </li>
              <li className="flex items-start">
                <span className="font-bold text-pink-500 mr-3">2.</span>
                Place a new order for the item you prefer
              </li>
              <li className="flex items-start">
                <span className="font-bold text-pink-500 mr-3">3.</span>
                We'll process your refund once the returned item is received
              </li>
            </ol>
          </div>

          {/* Damaged/Defective Items */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Damaged or Defective Items</h2>
            <p className="text-red-800 mb-4">
              If you receive a damaged or defective item, we sincerely apologize and will make it right immediately.
            </p>
            <div className="space-y-3 text-red-800">
              <p><strong>What to do:</strong></p>
              <ul className="ml-6 space-y-2">
                <li>• Contact us within <strong>48 hours</strong> of delivery</li>
                <li>• Provide photos of the damaged/defective item and packaging</li>
                <li>• Include your order number and description of the issue</li>
              </ul>
              <p className="mt-4">
                <strong>What we'll do:</strong> Provide a full refund or replacement at no additional cost, 
                including return shipping if needed.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Returns?</h2>
            <p className="text-gray-700 mb-4">
              Our customer service team is here to help with any questions about returns, refunds, or exchanges.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Methods</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    WhatsApp: <strong>08023170466</strong>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Email: <strong>bwittyhairs@gmail.com</strong>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
                  <li>Saturday: 10:00 AM - 6:00 PM</li>
                  <li>Sunday: 12:00 PM - 5:00 PM</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> January 2025<br />
                This policy may be updated from time to time. Please check this page for the most current version.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;