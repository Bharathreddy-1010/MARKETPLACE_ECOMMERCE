import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-stone-800/80 bg-[#0c0a09]/90 backdrop-blur-md py-12 text-[#f5f5f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Description */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500 text-[#0c0a09] flex items-center justify-center font-serif text-xs font-bold rounded-sm">
                M
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#f5f5f4]">MarketPlace</span>
            </div>
            <p className="text-xs font-sans text-stone-300 leading-relaxed max-w-sm">
              A trade counter for mills and makers. Verified cloth, honest minimums, and landed pricing before you commit.
            </p>
          </div>

          {/* Column 1: BUY */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-400">Buy</h4>
            <ul className="space-y-1.5 text-xs font-sans">
              <li><Link to="/marketplace" className="text-stone-300 hover:text-amber-300 transition-colors">Marketplace</Link></li>
              <li><Link to="/compare" className="text-stone-300 hover:text-amber-300 transition-colors">Sourcing assistant</Link></li>
              <li><Link to="/buyer-dashboard" className="text-stone-300 hover:text-amber-300 transition-colors">Buyer dashboard</Link></li>
            </ul>
          </div>

          {/* Column 2: SELL */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-400">Sell</h4>
            <ul className="space-y-1.5 text-xs font-sans">
              <li><Link to="/register?role=supplier" className="text-stone-300 hover:text-amber-300 transition-colors">List your mill</Link></li>
              <li><Link to="/supplier-dashboard" className="text-stone-300 hover:text-amber-300 transition-colors">Supplier dashboard</Link></li>
              <li><Link to="/supplier-inventory" className="text-stone-300 hover:text-amber-300 transition-colors">Inventory</Link></li>
            </ul>
          </div>

          {/* Column 3: TRADE DESK */}
          <div className="md:col-span-4 space-y-2 md:text-right">
            <h4 className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-400">Trade Desk</h4>
            <p className="text-xs font-sans text-stone-300">Mon–Fri 09:00–18:00 CET</p>
            <p className="text-xs font-sans text-stone-300">desk@marketplace.trade</p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-sans text-stone-400 gap-4">
          <p>© 2026 MarketPlace Trade Counter. All rights reserved.</p>
          <span className="font-sans uppercase tracking-widest font-semibold text-amber-400/80">
            Woven for Wholesale
          </span>
        </div>
      </div>
    </footer>
  );
}
