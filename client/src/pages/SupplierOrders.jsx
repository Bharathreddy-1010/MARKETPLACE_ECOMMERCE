import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Package, CheckCircle2, Clock } from 'lucide-react';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    api.getSupplierOrders()
      .then(res => setOrders(res.orders || []))
      .catch(err => console.error('Error fetching supplier orders:', err))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ['Pending', 'Confirmed', 'In Production', 'Dispatched', 'Delivered', 'Cancelled'];

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-[1.25] brightness-[1.35] contrast-[1.1]">
          <source src="/videos/my orders.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <div className="bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              MILL PIPELINE & INCOMING ORDERS
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#f5f5f4] flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" /> Incoming Trade Orders
            </h1>
          </div>
          <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-sans font-bold rounded-xl">
            Total Pipeline: {orders.length} orders
          </span>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="h-64 shimmer rounded-2xl" />
        ) : orders.length === 0 ? (
          <div className="bg-stone-950/90 border border-stone-800 p-12 text-center rounded-2xl backdrop-blur-md shadow-2xl space-y-2">
            <p className="text-xs font-sans text-stone-400">No orders currently assigned to your mill.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-stone-950/90 border border-stone-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-xl font-bold text-[#f5f5f4]">Order #{ord.orderNumber || ord.id}</span>
                      <span className="text-xs font-sans text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-sans text-stone-300 mt-1">
                      Buyer: <strong className="text-amber-400">{ord.buyerName || 'Buyer'}</strong> ({ord.buyerCompany || 'Fashion Brand'})
                    </p>
                  </div>

                  {/* Status Transition Control Dropdown */}
                  <div className="flex items-center gap-3 bg-stone-900/80 p-2 border border-stone-800 rounded-xl">
                    <span className="text-xs font-sans text-stone-400 font-medium">Order Status:</span>
                    <select
                      value={ord.status || 'Pending'}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      disabled={updatingId === ord.id}
                      className="bg-stone-950 border border-stone-700 text-amber-300 font-sans font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 block">Ordered Items</span>
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

                {/* Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-stone-900/80 p-4 border border-stone-800 rounded-xl">
                  <div>
                    <span className="font-sans text-amber-400 block font-bold mb-1">Shipping Destination:</span>
                    <p className="font-sans text-stone-200 leading-relaxed">
                      {ord.shippingAddress?.street || '14 Fashion Boulevard'}, {ord.shippingAddress?.city || 'Mumbai'}, {ord.shippingAddress?.postalCode || '400001'}, {ord.shippingAddress?.country || 'India'}
                    </p>
                  </div>
                  <div>
                    <span className="font-sans text-amber-400 block font-bold mb-1">Packaging & Mill Notes:</span>
                    <p className="font-sans text-stone-200 leading-relaxed">{ord.notes || 'Require humidity-controlled roll packaging.'}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
