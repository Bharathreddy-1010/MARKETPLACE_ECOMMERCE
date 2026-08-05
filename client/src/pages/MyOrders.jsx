import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Package, CheckCircle2, Clock, Truck, ShoppingBag, Search, AlertCircle, ArrowRight } from 'lucide-react';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    api.getBuyerOrders()
      .then(res => setOrders(res.orders || []))
      .catch(err => console.error('Error fetching buyer orders:', err))
      .finally(() => setLoading(false));
  };

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('dispatch')) return 3;
    if (s.includes('production') || s.includes('preparing') || s.includes('accepted')) return 2;
    if (s.includes('confirm')) return 1;
    return 0; // Pending
  };

  const steps = [
    { label: 'Order Placed', desc: 'Submitted to Mill' },
    { label: 'Mill Confirmed', desc: 'Stock Allocated' },
    { label: 'In Production', desc: 'Weaving & Finishing' },
    { label: 'Dispatched', desc: 'En Route to Atelier' },
    { label: 'Delivered', desc: 'Received at Facility' }
  ];

  const filteredOrders = orders.filter(o => {
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'PENDING' && (o.status === 'Pending' || o.status === 'Confirmed')) ||
      (selectedFilter === 'PRODUCTION' && (o.status === 'In Production' || o.status === 'Preparing')) ||
      (selectedFilter === 'DISPATCHED' && (o.status === 'Dispatched' || o.status === 'Ready for Dispatch')) ||
      (selectedFilter === 'DELIVERED' && (o.status === 'Delivered' || o.status === 'Completed'));

    const matchesSearch =
      !searchQuery ||
      (o.orderNumber || o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.items && o.items.some(i => (i.productName || '').toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BACKGROUND VIDEO ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-[1.25] brightness-[1.35] contrast-[1.1]">
          <source src="/videos/my orders.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/25" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-serif flex items-center justify-center text-base font-bold rounded-xl shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
                  TRADE ORDER TRACKING
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] font-sans font-bold rounded-md">
                  BUYER PORTAL
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#f5f5f4] mt-1">My Orders</h1>
              <p className="text-xs font-sans text-stone-400">
                Track live loom-to-dispatch progress for {user?.name || user?.email || 'your buyer account'}.
              </p>
            </div>
          </div>

          <Link
            to="/marketplace"
            className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-3 px-5 rounded-xl shadow transition-colors flex items-center gap-2 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-stone-950/90 border border-stone-800 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PRODUCTION', label: 'In Production' },
              { id: 'DISPATCHED', label: 'Dispatched' },
              { id: 'DELIVERED', label: 'Delivered' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition-all shrink-0 ${
                  selectedFilter === tab.id
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow'
                    : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search order # or fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-64 shimmer rounded-2xl" />
            <div className="h-64 shimmer rounded-2xl" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-stone-950/90 border border-stone-800 p-12 text-center rounded-2xl backdrop-blur-md shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#f5f5f4]">No Orders Found</h3>
              <p className="text-xs font-sans text-stone-400 mt-1 max-w-sm mx-auto">
                {orders.length === 0
                  ? "You haven't placed any fabric orders yet. Start sourcing verified mill fabrics from the marketplace."
                  : "No orders match your selected search or filter status."}
              </p>
            </div>
            <Link to="/marketplace" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-2.5 px-5 rounded-xl inline-block shadow">
              Explore Fabrics Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord) => {
              const currentStep = getStepIndex(ord.status);
              const orderTotal = (ord.totalAmount || ord.total || 0);

              return (
                <div key={ord.id} className="bg-stone-950/90 border border-stone-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
                  
                  {/* Order Top Summary Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl font-bold text-[#f5f5f4]">Order #{ord.orderNumber || ord.id}</span>
                        <span className="px-3 py-1 border border-amber-400/40 bg-amber-500/10 text-amber-300 text-xs font-sans font-bold rounded-lg">
                          {ord.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-stone-400 mt-1">
                        Mill Supplier: <strong className="text-white">{ord.supplierName || 'Apex Mills'}</strong> • Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 block">
                        Total Order Payable
                      </span>
                      <span className="font-sans font-bold text-2xl text-amber-400">
                        ₹{orderTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* ── STEP-BY-STEP LIVE TIMELINE TRACKER ── */}
                  <div className="py-2">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block mb-4">
                      LIVE TRACKING PROGRESS
                    </span>
                    <div className="grid grid-cols-5 gap-2 relative">
                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center space-y-2 relative z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow ${
                                isCurrent
                                  ? 'bg-amber-400 text-[#0c0a09] ring-4 ring-amber-400/30 scale-110'
                                  : isCompleted
                                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                                  : 'bg-stone-900 border border-stone-800 text-stone-600'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div>
                              <span className={`text-[11px] font-sans font-bold block ${isCompleted ? 'text-white' : 'text-stone-500'}`}>
                                {step.label}
                              </span>
                              <span className="text-[9px] font-sans text-stone-500 hidden sm:block">
                                {step.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">
                      FABRIC SPECIFICATIONS ({ord.items ? ord.items.length : 0} ITEMS)
                    </span>
                    <div className="space-y-2">
                      {ord.items && ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-stone-900/80 p-3.5 border border-stone-800 rounded-xl">
                          <div>
                            <span className="font-serif font-bold text-[#f5f5f4] text-sm block">{item.productName}</span>
                            <span className="text-[11px] font-sans text-stone-400">
                              Color: <strong className="text-stone-200">{item.color}</strong> • Quantity: <strong className="text-amber-400">{item.quantity} meters</strong> @ ₹{(item.unitPrice || 0).toLocaleString('en-IN')}/m
                            </span>
                          </div>
                          <span className="font-sans font-bold text-amber-400 text-sm">
                            ₹{(item.totalPrice || (item.unitPrice * item.quantity) || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-stone-900/80 p-4 border border-stone-800 rounded-xl">
                    <div>
                      <span className="font-sans text-amber-400 block font-bold mb-1">
                        Shipping Address:
                      </span>
                      <p className="font-sans text-stone-300 leading-relaxed">
                        {ord.shippingAddress?.street || '14 Fashion Boulevard'}, {ord.shippingAddress?.city || 'Mumbai'}, {ord.shippingAddress?.postalCode || '400001'}, {ord.shippingAddress?.country || 'India'}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-amber-400 block font-bold mb-1">
                        Inspection & Mill Notes:
                      </span>
                      <p className="font-sans text-stone-300 leading-relaxed">
                        {ord.notes || 'Require humidity-controlled roll packaging.'}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
