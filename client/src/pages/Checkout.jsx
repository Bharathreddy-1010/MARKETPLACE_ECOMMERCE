import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert, UserCheck } from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [authError, setAuthError] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    companyName: user?.company || 'Aura Couture Atelier',
    contactPerson: user?.name || 'Bharath Kumar',
    street: '14 Fashion Boulevard',
    city: 'Mumbai',
    postalCode: '400001',
    country: 'India',
    notes: 'Require humidity-controlled roll packaging.'
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (cartItems.length === 0) return;

    // If user is not logged in, auto-login with buyer demo or prompt login
    if (!user) {
      setLoading(true);
      try {
        await login('buyer@demo.com', 'password123');
      } catch (err) {
        setAuthError('Buyer authentication required to dispatch order.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems,
        shippingAddress: shippingInfo,
        notes: shippingInfo.notes
      };

      const res = await api.createOrder(orderPayload);
      setPlacedOrder(res.order);
      clearCart();
    } catch (err) {
      console.error('Failed to place order:', err);
      if (err.message && err.message.toLowerCase().includes('auth')) {
        setAuthError('Authentication required. Please log in as a Buyer.');
      } else {
        setAuthError(err.message || 'Order creation failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBuyerLogin = async () => {
    try {
      setLoading(true);
      setAuthError('');
      await login('buyer@demo.com', 'password123');
    } catch (err) {
      setAuthError('Quick login failed. Click below to go to the Login page.');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="relative min-h-[calc(100vh-56px)] bg-[#0c0a09] text-[#f5f5f4] flex items-center justify-center p-4">
        
        {/* Background Video */}
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[1.1] scale-105">
            <source src="/videos/Marketplace2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0c0a09]/70" />
        </div>

        <div className="relative z-10 max-w-xl w-full bg-stone-950/90 border border-stone-800 p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-md text-center space-y-6">
          
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              TRADE DESK DISPATCH
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#f5f5f4] mt-1">
              Order Confirmed
            </h1>
            <p className="text-xs font-sans text-stone-400 mt-1">
              Order Number: <strong className="text-white">#{placedOrder.orderNumber || placedOrder.id}</strong>
            </p>
          </div>

          <p className="text-xs font-sans text-stone-300 max-w-md mx-auto leading-relaxed">
            Your cloth order has been transmitted directly to <strong>{placedOrder.supplierName || 'Apex Mills'}</strong>. The mill has been notified for allocation and quality dispatch.
          </p>

          <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Order Status</span>
              <span className="font-bold text-amber-400">{placedOrder.status}</span>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-2">
              <span className="text-stone-400">Total Amount</span>
              <span className="font-bold text-[#f5f5f4]">₹{(placedOrder.totalAmount || placedOrder.total || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Destination</span>
              <span className="text-stone-200">{placedOrder.shippingAddress?.city || 'Mumbai'}, {placedOrder.shippingAddress?.country || 'India'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/buyer-dashboard" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-3 px-5 rounded-xl shadow transition-colors">
              Track Order in Buyer Dashboard
            </Link>
            <Link to="/marketplace" className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs py-3 px-5 rounded-xl transition-colors">
              Back to Marketplace
            </Link>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-[1.25] brightness-[1.1] contrast-[1.05]">
          <source src="/videos/Marketplace2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              TRADE ORDER DISPATCH
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#f5f5f4]">Checkout</h1>
          </div>
          <Link to="/cart" className="text-xs font-sans text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
        </div>

        {/* Unauthenticated Buyer Banner */}
        {!user && (
          <div className="bg-stone-950/90 border border-amber-500/40 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-xs text-[#f5f5f4]">
                  Buyer Sign In Required to Dispatch Order
                </h3>
                <p className="text-[11px] font-sans text-stone-400">
                  Log in with your Buyer account or use 1-click Buyer Demo authentication below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleQuickBuyerLogin}
                className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-2 px-3.5 rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5" /> 1-Click Buyer Login
              </button>
              <Link
                to="/login"
                className="bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-sans font-medium text-xs py-2 px-3.5 rounded-xl transition-colors shrink-0"
              >
                Go to Login Page →
              </Link>
            </div>
          </div>
        )}

        {authError && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-sans rounded-2xl flex items-center justify-between">
            <span>{authError}</span>
            <Link
              to="/login"
              className="underline font-bold text-amber-400 ml-2 hover:text-amber-300 transition-colors"
            >
              Go to Login Page →
            </Link>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Delivery Address & Notes */}
          <div className="lg:col-span-2 bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-5">
            <h3 className="font-serif text-xl font-bold text-[#f5f5f4] border-b border-stone-800 pb-3">
              Delivery Address & Mill Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-sans font-bold text-stone-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.companyName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, companyName: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-sans font-bold text-stone-300 mb-1.5">Contact Person</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.contactPerson}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, contactPerson: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1.5">Street Address</label>
              <input
                type="text"
                required
                value={shippingInfo.street}
                onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-sans font-bold text-stone-300 mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-sans font-bold text-stone-300 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.postalCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1.5">Country</label>
              <input
                type="text"
                required
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1.5">Inspection & Packaging Notes</label>
              <textarea
                rows={3}
                value={shippingInfo.notes}
                onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs font-sans text-white focus:outline-none focus:border-amber-400"
              />
            </div>

          </div>

          {/* Order Summary & Submit */}
          <div className="space-y-6">
            <div className="bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#f5f5f4] border-b border-stone-800 pb-3">
                Review ({cartItems.length} items)
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-stone-800/80">
                    <div>
                      <span className="font-serif font-bold text-[#f5f5f4] block">{item.productName}</span>
                      <span className="text-[10px] font-sans text-stone-400">{item.color} • {item.quantity}m</span>
                    </div>
                    <span className="font-sans font-bold text-amber-400">₹{((item.unitPrice || 0) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Est. Shipping & Insurance</span>
                  <span>₹2,000</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#f5f5f4] pt-2 border-t border-stone-800">
                  <span>Total Payable</span>
                  <span className="text-amber-400">₹{(cartTotal + 2000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors mt-4"
              >
                {loading ? 'Transmitting Order...' : 'Dispatch Trade Order'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
