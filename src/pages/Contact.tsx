import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Instagram } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-200">
            Get in touch with our team - we're here to help with all your needs
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                We'd love to hear from you! Whether you have questions about our products, need assistance 
                with an order, or just want to say hello, don't hesitate to reach out.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                  <p className="text-gray-600">
                    Dr Efosa Osayamwen Close<br />
                    Cedar Estate, Therra Peace Estate
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone & WhatsApp</h3>
                  <p className="text-gray-600">08023170466</p>
                  <a
                    href="https://wa.me/2348023170466"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">bwittyhairs@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <div className="text-gray-600 text-sm">
                    <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p>Saturday: 10:00 AM - 6:00 PM</p>
                    <p>Sunday: 12:00 PM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/bwittyhairs?igsh=aDZlamJicXdhOHh0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg text-white hover:shadow-lg transition-shadow"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@bwittyhairs?_t=ZS-8yzsgTBd36l&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black p-3 rounded-lg text-white hover:shadow-lg transition-shadow"
                >
                  <div className="w-6 h-6 bg-current rounded"></div>
                </a>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-pink-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
              <div className="text-sm text-gray-700">
                <p className="mb-1"><strong>Bank:</strong> OPay</p>
                <p><strong>Account Number:</strong> 6105117947</p>
                <p className="text-xs text-gray-600 mt-2">
                  Please use your order number or name as reference when making transfers
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {submitted && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1 mr-3">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Message Sent!</p>
                    <p className="text-sm text-green-700">
                      Thank you for contacting us. We'll get back to you soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="08023170466"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="shipping">Shipping Question</option>
                  <option value="return-refund">Return/Refund</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Please provide as much detail as possible..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600 text-black'
                }`}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;