import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Package, CheckCircle2, User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBuyerOrders()
      .then(res => setOrders(res.orders || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BACKGROUND VIDEO ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-[1.25] brightness-[1.1] contrast-[1.05]">
          <source src="/videos/Marketplace2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/40" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-serif flex items-center justify-center text-base font-bold rounded-xl shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                  APPAREL BUYER DASHBOARD
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] font-sans font-bold rounded-md">
                  BUYER ACCOUNT
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#f5f5f4]">{user?.name || 'Buyer'}</h1>
              <p className="text-xs font-sans text-stone-400">{user?.company || 'Fashion Brand'} • {user?.email}</p>
            </div>
          </div>

          <Link
            to="/marketplace"
            className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Fabrics
          </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h2 className="font-serif text-xl font-bold text-[#f5f5f4] flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" /> My Fabric Orders ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="h-64 shimmer rounded-2xl" />
          ) : orders.length === 0 ? (
            <div className="bg-stone-950/90 border border-stone-800 p-12 text-center rounded-2xl backdrop-blur-md shadow-2xl space-y-3">
              <p className="text-xs font-sans text-stone-400">You haven't placed any fabric orders yet.</p>
              <Link to="/marketplace" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-xs py-2.5 px-5 rounded-xl inline-block shadow">
                Start Sourcing Fabrics
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-sm text-[#f5f5f4]">Order #{ord.orderNumber || ord.id}</span>
                        <span className="px-2.5 py-0.5 border border-amber-400/40 bg-amber-500/10 text-amber-300 text-[10px] font-sans font-bold rounded-md">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-stone-400 mt-1">
                        Mill Supplier: <strong className="text-stone-200">{ord.supplierName}</strong> • {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-sans text-stone-400 block">Total Amount</span>
                      <span className="font-sans font-bold text-lg text-amber-400">₹{(ord.total || ord.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items && ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-stone-900/80 p-3 border border-stone-800 rounded-xl">
                        <div>
                          <span className="font-serif font-bold text-[#f5f5f4] block">{item.productName}</span>
                          <span className="text-[10px] font-sans text-stone-400">{item.color} • {item.quantity}m @ ₹{(item.unitPrice || 0).toLocaleString('en-IN')}/m</span>
                        </div>
                        <span className="font-sans font-bold text-amber-400">₹{(item.totalPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {ord.history && ord.history.length > 0 && (
                    <div className="pt-2 border-t border-stone-800">
                      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-400 block mb-1">Status Trail</span>
                      <div className="space-y-1">
                        {ord.history.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 text-[11px] font-sans text-stone-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-semibold text-white">{h.status}:</span>
                            <span>{h.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
