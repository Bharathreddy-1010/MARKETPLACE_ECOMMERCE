import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, role, company });
      if (role === 'supplier') {
        navigate('/supplier-dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0c0a09] text-[#f5f5f4] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      
      {/* ── LEFT HALF (50%): BRIGHT BACKGROUND VIDEO + TEXTILE TRADE DESK HERO ── */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[420px] lg:min-h-full border-r border-stone-800/80">
        
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-[1.1] contrast-[1.05] scale-[1.05]"
          >
            <source src="/videos/Login page.mp4" type="video/mp4" />
          </video>
          {/* Backdrop overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/50 to-[#0c0a09]/40" />
        </div>

        {/* Top Tag */}
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400 block drop-shadow">
            MARKETPLACE TRADE DESK
          </span>
        </div>

        {/* Middle Heading & Tagline */}
        <div className="relative z-10 space-y-4 my-auto py-12 max-w-xl">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#f5f5f4] leading-[1.12] drop-shadow-md">
            Cloth you can specify, <br />
            <span className="italic font-normal text-amber-200/90">quantities you can actually buy.</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-stone-200 leading-relaxed max-w-md drop-shadow">
            Live stock from vetted mills, minimums stated up front, and every order tracked from loom to dispatch.
          </p>
        </div>

        {/* Bottom Trade Counters */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-6 border-t border-stone-700/60 max-w-md">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400 block">
              MILLS
            </span>
            <span className="font-serif text-2xl font-bold text-[#f5f5f4]">40+</span>
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400 block">
              QUALITIES
            </span>
            <span className="font-serif text-2xl font-bold text-[#f5f5f4]">1,200</span>
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400 block">
              COUNTRIES
            </span>
            <span className="font-serif text-2xl font-bold text-[#f5f5f4]">18</span>
          </div>
        </div>

      </div>

      {/* ── RIGHT HALF (50%): REGISTER FORM ── */}
      <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-[#0c0a09] relative z-10">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f5f4]">
              Open an Account
            </h2>
            <p className="text-xs font-sans text-stone-400 mt-2">
              Join the B2B wholesale textile network.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-sans rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition-all ${
                    role === 'buyer'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  Fashion Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition-all ${
                    role === 'supplier'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  Textile Mill / Supplier
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1">
                Company / Studio Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Rostova Atelier"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-4 pr-11 py-2.5 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-sans font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Trader Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1.5 pt-4 border-t border-stone-800/80 text-xs font-sans text-stone-400">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold underline ml-1">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
