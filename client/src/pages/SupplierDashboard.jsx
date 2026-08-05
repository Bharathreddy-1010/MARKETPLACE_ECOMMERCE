import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle2, Package, Clock, Building2 } from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ supplierId: user?.id }),
      api.getSupplierOrders()
    ])
      .then(([prodRes, ordRes]) => {
        setProducts(prodRes.products || []);
        setOrders(ordRes.orders || []);
      })
      .catch(err => console.error('Error fetching supplier dashboard data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const pendingOrdersCount = orders.filter(o => o && o.status === 'Pending').length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o?.totalAmount || o?.total || 0), 0);

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT BACKGROUND VIDEO FOR SUPPLIER PORTAL ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] brightness-[1.35] contrast-[1.1]"
        >
          <source src="/videos/Supplier dashboard.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/25" />
      </div>

      {/* Main Content Layer */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-serif flex items-center justify-center text-base font-bold rounded-xl shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                  MILL OPERATIONS PORTAL
                </span>
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] font-sans font-bold rounded-md">
                  MILL ACCOUNT
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#f5f5f4] mt-1">
                {user?.name || user?.companyName || 'Apex Mills International'}
              </h1>
              <p className="text-xs font-sans text-stone-400 mt-1">
                Supplier ID: <strong className="text-white">{user?.id || 'supplier_demo'}</strong> • {user?.email}
              </p>
            </div>
          </div>

          <Link
            to="/supplier-inventory"
            className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-3 px-5 rounded-xl shadow transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Fabric Quality
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Qualities', value: products.length || 12 },
            { label: 'Pending Orders', value: pendingOrdersCount || 0 },
            { label: 'Total Revenue', value: `₹${totalRevenue > 0 ? totalRevenue.toLocaleString('en-IN') : '2,80,050'}` },
            { label: 'Stock Status', value: 'Healthy' },
          ].map(metric => (
            <div key={metric.label} className="bg-stone-950/90 border border-stone-800 p-5 rounded-2xl backdrop-blur-md shadow-2xl space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                {metric.label}
              </span>
              <span className="font-serif text-2xl font-bold text-[#f5f5f4] block">
                {metric.value}
              </span>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#f5f5f4]">Recent Trade Orders</h3>
              <p className="text-xs font-sans text-stone-400 mt-0.5">Live orders submitted by fashion buyers.</p>
            </div>
            <Link to="/supplier-orders" className="text-xs font-sans text-amber-400 hover:text-amber-300 font-semibold underline">
              View all orders →
            </Link>
          </div>

          <div className="space-y-3 text-xs font-sans">
            {orders.slice(0, 5).map((ord) => {
              const amount = (ord?.totalAmount || ord?.total || 0);
              return (
                <div key={ord.id} className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-[#f5f5f4]">Order #{ord.orderNumber || ord.id}</span>
                      <span className="px-2.5 py-0.5 border border-amber-400/40 bg-amber-500/10 text-amber-300 text-[10px] font-sans font-bold rounded-md">
                        {ord.status || 'Pending'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-1">
                      Buyer: <strong className="text-stone-200">{ord.buyerCompany || ord.buyerName || 'Apparel Studio'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-base text-amber-400">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {orders.length === 0 && !loading && (
              <p className="text-xs font-sans text-stone-400 text-center py-6">
                No active orders assigned to your mill yet.
              </p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
