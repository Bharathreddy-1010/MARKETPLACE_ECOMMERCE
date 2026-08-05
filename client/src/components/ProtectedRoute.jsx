import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. If route requires guest/buyer access only (e.g. Home, Marketplace, Cart) but user is a Supplier -> Redirect Supplier to Supplier Dashboard
  if (allowedRole === 'buyer_or_guest') {
    if (user && user.role === 'supplier') {
      return <Navigate to="/supplier-dashboard" replace />;
    }
    return children;
  }

  // 2. Not Logged In -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role Mismatch -> Block and show clean guidance
  if (allowedRole && user.role !== allowedRole) {
    const isSupplierTryingBuyer = user.role === 'supplier' && allowedRole === 'buyer';

    return (
      <div className="relative min-h-[calc(100vh-56px)] bg-[#0c0a09] text-[#f5f5f4] flex items-center justify-center p-4">
        
        {/* Background video layer for aesthetic consistency */}
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[1.1] scale-105">
            <source src="/videos/Login page.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0c0a09]/70" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-stone-950/90 border border-stone-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md text-center space-y-6">
          
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              ACCESS RESTRICTED
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#f5f5f4]">
              {isSupplierTryingBuyer ? 'Buyer Dashboard Reserved' : 'Mill Portal Reserved'}
            </h2>
            <p className="text-xs font-sans text-stone-300 leading-relaxed">
              {isSupplierTryingBuyer ? (
                <>
                  You are currently logged in as a <strong className="text-amber-400">Supplier / Mill ({user.email})</strong>. Supplier accounts cannot access Buyer pages. If you want to shop or view buyer pages, please log out and sign in with a Buyer account.
                </>
              ) : (
                <>
                  You are currently logged in as a <strong className="text-amber-400 font-semibold">Buyer ({user.email})</strong>. Buyer accounts cannot access the Supplier Portal. If you want to list fabric stock, please log out and sign in with a Supplier account.
                </>
              )}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary Action: Go to allowed dashboard */}
            <Link
              to={user.role === 'supplier' ? '/supplier-dashboard' : '/buyer-dashboard'}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              Go to Your {user.role === 'supplier' ? 'Mill Dashboard' : 'Buyer Dashboard'} <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Secondary Action: Logout & Switch Account */}
            <button
              onClick={logout}
              className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-sans font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Switch Account / Register {allowedRole === 'supplier' ? 'Supplier' : 'Buyer'}
            </button>
          </div>

        </div>

      </div>
    );
  }

  return children;
}
