import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistantWidget from './components/AIAssistantWidget';
import AIOnboardingModal from './components/AIOnboardingModal';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import CompareProducts from './pages/CompareProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierInventory from './pages/SupplierInventory';
import SupplierOrders from './pages/SupplierOrders';
import Login from './pages/Login';
import Register from './pages/Register';

function MainLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContextProduct, setAiContextProduct] = useState(null);
  const { showOnboardingModal, setShowOnboardingModal } = useAuth();

  const handleOpenAiWithContext = (product) => {
    setAiContextProduct(product);
    setAiOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-body">
      <ScrollToTop />
      <Navbar onOpenAi={() => setAiOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Buyer & Guest Routes (Suppliers are redirected to Supplier Portal) */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <Home onOpenAi={() => setAiOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <Marketplace onOpenAi={() => setAiOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <ProductDetail onOpenAiWithContext={handleOpenAiWithContext} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <CompareProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="buyer_or_guest">
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Protected Buyer Orders Route */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="buyer">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRole="buyer">
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Protected Supplier / Mill Routes */}
          <Route
            path="/supplier-dashboard"
            element={
              <ProtectedRoute allowedRole="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-inventory"
            element={
              <ProtectedRoute allowedRole="supplier">
                <SupplierInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-orders"
            element={
              <ProtectedRoute allowedRole="supplier">
                <SupplierOrders />
              </ProtectedRoute>
            }
          />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer />

      <AIAssistantWidget
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        initialContextProduct={aiContextProduct}
      />

      <AIOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
