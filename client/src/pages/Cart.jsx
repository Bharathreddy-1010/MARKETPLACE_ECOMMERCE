import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowRight, Plus, Minus, X } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0c0a09] text-[#f5f5f4]">
      
      {/* ── CONTINUOUS BRIGHT FIXED BACKGROUND VIDEO FOR CART PAGE ── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.25] origin-top-left brightness-[1.2] contrast-[1.05]"
        >
          <source src="/videos/Create_a_premium_abstract_cine.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c0a09]/30" />
      </div>

      {/* ── PAGE CONTENT LAYER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
        
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">Order Desk</span>
            <h1 className="font-serif text-3xl font-bold text-[#f5f5f4]">
              Shopping Cart <span className="font-sans text-sm font-normal text-stone-400">({cartItems.length} items)</span>
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-xs font-sans text-stone-400 hover:text-rose-400">
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-stone-950/90 border border-stone-800 p-12 text-center space-y-4 max-w-lg mx-auto rounded-2xl backdrop-blur-md shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#f5f5f4]">Your trade order is empty</h3>
            <p className="text-xs font-sans text-stone-400">Explore verified qualities directly from textile mills.</p>
            <Link to="/marketplace" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-xs py-2.5 px-5 rounded inline-block shadow transition-colors">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item, idx) => {
                const itemTotal = (item.price * item.quantity).toLocaleString('en-IN');
                return (
                  <div
                    key={`${item.productId}-${item.color}-${idx}`}
                    className="bg-stone-950/90 border border-stone-800/90 p-4 rounded-xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <img
                      src={item.image || '/images/Compact Cotton Poplin.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-stone-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                      <h4 className="font-serif font-bold text-base text-[#f5f5f4] truncate">{item.name}</h4>
                      <p className="text-xs font-sans text-stone-400">{item.color} • ₹{item.price.toLocaleString('en-IN')} / meter</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.quantity - 10)}
                          className="p-1 text-stone-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-sans font-bold text-white">{item.quantity}m</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.quantity + 10)}
                          className="p-1 text-stone-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-sans font-bold text-amber-400 min-w-[80px] text-right">₹{itemTotal}</span>

                      <button
                        onClick={() => removeFromCart(item.productId, item.color)}
                        className="p-1 text-stone-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 bg-stone-950/90 border border-stone-800 p-6 rounded-xl space-y-6 backdrop-blur-md shadow-2xl">
              <h3 className="font-serif text-xl font-bold text-[#f5f5f4] border-b border-stone-800 pb-3">Order Summary</h3>

              <div className="flex items-center justify-between text-sm">
                <span className="font-sans text-stone-400">Subtotal</span>
                <span className="font-sans font-bold text-amber-400">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
