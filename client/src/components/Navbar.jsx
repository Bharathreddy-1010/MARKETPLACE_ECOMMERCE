import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Menu, X, LayoutDashboard, Package, Clock, Building2, PackageCheck } from 'lucide-react';

export default function Navbar({ onOpenAi }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isSupplier = user?.role === 'supplier';

  return (
    <header className="w-full bg-[#0c0a09]/90 backdrop-blur-md border-b border-stone-800/80 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo + Role-Specific Main Nav */}
          <div className="flex items-center gap-8">
            <Link to={isSupplier ? '/supplier-dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-amber-500 text-[#0c0a09] flex items-center justify-center font-serif text-sm font-bold rounded-sm shadow-sm">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#f5f5f4] leading-tight">
                  MarketPlace
                </span>
                {isSupplier && (
                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-amber-400">
                    MILL PORTAL
                  </span>
                )}
              </div>
            </Link>

            {/* Nav Links: Supplier vs Buyer/Guest */}
            <nav className="hidden md:flex items-center gap-2">
              {isSupplier ? (
                <>
                  <Link
                    to="/supplier-dashboard"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors flex items-center gap-1.5 ${
                      isActive('/supplier-dashboard')
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Mill Dashboard
                  </Link>

                  <Link
                    to="/supplier-inventory"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors flex items-center gap-1.5 ${
                      isActive('/supplier-inventory')
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" /> Fabric Qualities
                  </Link>

                  <Link
                    to="/supplier-orders"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors flex items-center gap-1.5 ${
                      isActive('/supplier-orders')
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Incoming Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors ${
                      isActive('/')
                        ? 'bg-stone-800 text-white font-semibold border border-stone-700'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/marketplace"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors ${
                      isActive('/marketplace')
                        ? 'bg-stone-800 text-white font-semibold border border-stone-700'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Marketplace
                  </Link>
                  <button
                    onClick={onOpenAi}
                    className="px-3 py-1 text-xs font-sans font-medium text-stone-300 hover:text-white transition-colors"
                  >
                    Assistant
                  </button>
                  <Link
                    to="/compare"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors ${
                      isActive('/compare')
                        ? 'bg-stone-800 text-white font-semibold border border-stone-700'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Comparator
                  </Link>
                  <Link
                    to="/orders"
                    className={`px-3 py-1 text-xs font-sans font-medium rounded transition-colors flex items-center gap-1.5 ${
                      isActive('/orders') || isActive('/buyer-dashboard')
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/40'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-amber-400" /> My Orders
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Bag Icon (Only shown for Buyers/Guests) */}
            {!isSupplier && (
              <Link
                to="/cart"
                className="relative p-1.5 text-stone-300 hover:text-white transition-colors"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-[#0c0a09] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isSupplier ? '/supplier-dashboard' : '/orders'}
                  className="text-xs font-sans font-medium text-stone-200 hover:text-white hover:underline flex items-center gap-1.5 bg-stone-900/90 border border-stone-700/80 py-1 px-2.5 rounded-lg"
                >
                  {isSupplier ? (
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="truncate max-w-[140px]">{user.name || user.email}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                    {isSupplier ? 'Mill' : 'Buyer'}
                  </span>
                </Link>

                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-sans font-medium text-stone-300 hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold text-xs py-1.5 px-3.5 rounded-lg shadow-sm transition-colors">
                  Open a trader account
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0a09]/95 backdrop-blur-md border-t border-stone-800 px-4 py-3 space-y-2">
          {isSupplier ? (
            <>
              <Link
                to="/supplier-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Mill Dashboard
              </Link>
              <Link
                to="/supplier-inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Fabric Qualities
              </Link>
              <Link
                to="/supplier-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Incoming Orders
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Marketplace
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAi(); }}
                className="block text-xs font-sans font-medium text-white py-1 text-left"
              >
                Assistant
              </button>
              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-white py-1"
              >
                Comparator
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-sans font-medium text-amber-300 py-1"
              >
                My Orders
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
