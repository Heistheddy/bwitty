import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { MessageProvider } from './context/MessageContext';
import LoadingScreen from './components/LoadingScreen';
import CartNotification from './components/CartNotification';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Policies from './pages/Policies';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMessages from './pages/admin/AdminMessages';
import OrderConfirmation from './pages/OrderConfirmation';
import UserAccount from './pages/UserAccount';
import OrderDetails from './pages/OrderDetails';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import ChangeEmail from './pages/ChangeEmail';
import { Toaster } from './components/Toaster';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartNotification, setCartNotification] = useState({
    show: false,
    productName: '',
  });

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <OrderProvider>
        <MessageProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-white flex flex-col">
                <CartNotification
                  show={cartNotification.show}
                  onClose={() => setCartNotification({ show: false, productName: '' })}
                  productName={cartNotification.productName}
                />
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:category" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/register" element={<UserRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/change-email" element={<ChangeEmail />} />
                    <Route path="/account" element={<UserAccount />} />
                    <Route path="/account/orders/:orderId" element={<OrderDetails />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/messages" element={<AdminMessages />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </Router>
          </CartProvider>
        </MessageProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;